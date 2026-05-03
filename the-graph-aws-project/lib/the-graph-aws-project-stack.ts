import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';

export class TheGraphAwsProjectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. VPCの作成（NAT Gatewayなしでコスト削減！）
    const vpc = new ec2.Vpc(this, 'GraphVpc', {
      maxAzs: 2,
      natGateways: 0, // 👈 ここ重要！NAT代をゼロにする
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'Isolated',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED, // RDS用（インターネットアクセスなし）
        }
      ]
    });

    // 2. PostgreSQLデータベースの作成（The Graphのデータ保存用）
    const database = new rds.DatabaseInstance(this, 'GraphDatabase', {
      engine: rds.DatabaseInstanceEngine.postgres({ version: rds.PostgresEngineVersion.VER_15 }),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.MICRO),
      allocatedStorage: 20,
      databaseName: 'graphnode',
      removalPolicy: cdk.RemovalPolicy.DESTROY, // テスト用なのでスタック削除時にDBも消す
    });

    // 3. ECSクラスターの作成
    const cluster = new ecs.Cluster(this, 'GraphCluster', { vpc });

    // 4. The Graph Node（Fargate）の作成
    const graphNodeService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, 'GraphNodeService', {
      cluster,
      cpu: 512,
      memoryLimitMiB: 1024,
      assignPublicIp: true, // 👈 NATがないのでPublic IPを付与してインターネットに出る
      taskSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      taskImageOptions: {
        image: ecs.ContainerImage.fromRegistry('graphprotocol/graph-node:latest'),
        environment: {
          'postgres_host': database.dbInstanceEndpointAddress,
          'postgres_user': 'postgres',
          'postgres_pass': database.secret?.secretValueFromJson('password').unsafeUnwrap() || '',
          'postgres_db': 'graphnode',
          'ipfs': 'https://ipfs.network.thegraph.com', // 外部の公開IPFSを利用
          // 👇 ここをさっきAlchemyでコピーしたURLに書き換えてね！！！
          'ethereum': 'mainnet:https://eth-mainnet.g.alchemy.com/v2/UBw33FNdpecJN1-RU_FS8',

          'node_role': 'index-node',
          'node_id': 'my-aws-node'
        },
        containerPort: 8000,
      },
      capacityProviderStrategies: [
        {
          capacityProvider: 'FARGATE_SPOT', // 👈 Spot利用で激安に！
          weight: 1,
        },
      ],
    });

    // FargateからRDSへのアクセスを許可
    database.connections.allowDefaultPortFrom(graphNodeService.service.connections);
  }
}
