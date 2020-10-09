import { Construct } from '@aws-cdk/core';
import { HostedZone, IHostedZone } from '@aws-cdk/aws-route53';
import { Certificate, ICertificate } from '@aws-cdk/aws-certificatemanager';

export interface DistributionProps {
  stage: string;
}

export class ZoneDistribution extends Construct {
  // domain
  public readonly domainName: string;

  // api
  public readonly apiDomainName: string;
  public readonly apiHostedZoneId: string;
  public readonly apiCertificateARN: string;
  public readonly apiHostedZone: IHostedZone;
  public readonly apiCertificate: ICertificate;

  // assets
  public readonly assetsDomainName: string;
  public readonly assetsHostedZoneId: string;
  public readonly assetsCertificateARN: string;
  public readonly assetsHostedZone: IHostedZone;
  public readonly assetsCertificate: ICertificate;


  constructor( scope: Construct, id: string, props: DistributionProps ) {
    super( scope, id );

    const { stage } = props;

    // domain
    this.domainName = this.node.tryGetContext( '@domain:name' );

    // api
    this.apiDomainName = this.node.tryGetContext( '@domain:api-domain' ) + this.domainName;
    this.apiHostedZoneId = this.node.tryGetContext( '@domain:api-zone-id' );
    this.apiCertificateARN = this.node.tryGetContext( '@domain:api-certificate' );

    this.apiHostedZone = HostedZone.fromHostedZoneAttributes( this, 'api-zone', {
      hostedZoneId: this.apiHostedZoneId,
      zoneName: this.apiDomainName
    } );
    this.apiCertificate = Certificate.fromCertificateArn( this, 'api-cert', this.apiCertificateARN );


    // assets
    this.assetsDomainName = this.node.tryGetContext( '@domain:assets-domain' ) + this.domainName;
    this.assetsHostedZoneId = this.node.tryGetContext( '@domain:assets-zone-id' );
    this.assetsCertificateARN = this.node.tryGetContext( '@domain:assets-certificate' );

    this.assetsHostedZone = HostedZone.fromHostedZoneAttributes( this, 'assets-zone', {
      hostedZoneId: this.assetsHostedZoneId,
      zoneName: this.assetsDomainName
    } );
    this.assetsCertificate = Certificate.fromCertificateArn( this, 'assets-cert', this.assetsCertificateARN );

  }
}
