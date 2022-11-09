/* import 'source-map-support/register'

import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({ signatureVersion: 'v4' })
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export function getAttachmentUrl(attachmentId: string): string {
  return `https://${bucketName}.s3.amazonaws.com/${attachmentId}`
}

export function getUploadUrl(attachmentId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: attachmentId,
    Expires: urlExpiration
  })
}
 */
import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

//Accessing the S3buckets
const Bucket_Name = process.env.ATTACHMENT_S3_BUCKET
//Accessing the Expiration Time
const ExpirationTime = 300
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})
export function getAttachmentUrl(attachmentId: string): string {
  return `https://${Bucket_Name}.s3.amazonaws.com/${attachmentId}`
}
export function getUploadUrl(imageId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: Bucket_Name,
    Key: imageId,
    Expires: ExpirationTime
  })
}
