import { Bucket } from '@aws-cdk/aws-s3';
import { ZoneDistribution } from './zone-distribution';
import { Construct } from '@aws-cdk/core';
import {
  CloudFrontWebDistribution,
  OriginAccessIdentity,
  SecurityPolicyProtocol,
  ViewerCertificate
} from '@aws-cdk/aws-cloudfront';
import { ARecord, RecordTarget } from '@aws-cdk/aws-route53';
import { CloudFrontTarget } from '@aws-cdk/aws-route53-targets';

export interface AssetsCdnProps {
  stage: string;
  zoneDistribution: ZoneDistribution;
  distributionBucket: Bucket;
}

export class AssetsCdn extends Construct {
  constructor(scope: Construct, id: string, props: AssetsCdnProps) {
    super(scope, id);

    const { distributionBucket } = props;

    const originAccessIdentity = new OriginAccessIdentity(
      this,
      "OriginAccessIdentity",
      {
        comment: `CloudFront OriginAccessIdentity for ${distributionBucket.bucketName}`,
      }
    );

    distributionBucket.grantRead(originAccessIdentity.grantPrincipal);


    const serviceAppDistribution = new CloudFrontWebDistribution(this, 'assets-cdn-dist', {
      originConfigs: [
        {
          s3OriginSource: {
            originAccessIdentity,
            s3BucketSource: distributionBucket,
          },
          /*
          failoverCustomOriginSource: {
              domainName: `${restApi.restApiId}.execute-api.${this.region}.amazonaws.com`,
              originPath: `/${stage}`,
          },
          failoverCriteriaStatusCodes: [ FailoverStatusCode.NOT_FOUND, FailoverStatusCode.FORBIDDEN ],
           */
          behaviors: [
            {
              isDefaultBehavior: true,
              forwardedValues: {
                queryString: true,
                headers: [ 'Authorization' ]
              }
            },
          ],
        },
      ],
      viewerCertificate: ViewerCertificate.fromAcmCertificate(props.zoneDistribution.assetsCertificate, {
        aliases: [props.zoneDistribution.assetsDomainName],
        securityPolicy: SecurityPolicyProtocol.TLS_V1_2_2019
      })
    })

    const record = new ARecord(this, `service-cdn-dist-record-${props.stage}`,{
      zone: props.zoneDistribution.assetsHostedZone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(serviceAppDistribution)),
      recordName: props.zoneDistribution.assetsDomainName
    })
  }
}
