export enum ImageResources {
  TICKET = 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/resources/ticket.png',
  SMS_CHECK = 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/resources/sms.png',
}

const imageUtils = {
  get: (resource: ImageResources) => resource,
};

export default imageUtils;
