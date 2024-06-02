import Joi from "joi"
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomBytes } from "crypto";
import { ObjectId, isValidObjectId } from "mongoose";
import { RequestType } from "./types";
import { UploadApiErrorResponse, UploadApiResponse, v2 as cloudinary } from "cloudinary";
//@ts-ignore
import toStream = require("buffer-to-stream");
import { User } from "@prisma/client";

/**
 *this function checks if all environment variables are available
 */
export const validateEnvironmentVariables = () => {
  const schema = Joi.object({
    PRIVATE_KEY: Joi.string().required(),
    DATABASE_URL: Joi.string().required(),
    FRONTEND_URL: Joi.string().required()
  })
  return schema.validate({
    PRIVATE_KEY: process.env.PRIVATE_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    FRONTEND_URL: process.env.FRONTEND_URL
  })
}

export const generateAuthToken = (userId: string) => {
  return jwt.sign({ id: userId }, `${process.env.PRIVATE_KEY}`)
}

export const comparePasswords = async (rawPassword: string, originalPassword: string) => await bcrypt.compare(rawPassword, originalPassword)

export const generateHashedPassword = (rawPassword: string) => bcrypt.hashSync(rawPassword, 10)


export const validateRequestBody = (
  data: any,
  type: RequestType,
) => {

  const commonSchema = {
    email: Joi.string().email().required().min(3).max(70),
    password: Joi.string().required().min(5).max(20),
    name: Joi.string().required().min(3).max(100),
  };


  const schemas: any = {
    [RequestType.SIGN_IN]: Joi.object({ email: commonSchema.email, password: commonSchema.password }),
    [RequestType.SIGN_UP]: Joi.object(commonSchema),
    [RequestType.PLACE_ORDER]: Joi.object({
      productId: Joi.string().required().min(3),
      productDetails: Joi.string().optional().min(3),
      productName: Joi.string().min(3),

      vendorId: Joi.string().required().label("Vendor's ID"),

      customerEmail: Joi.string().email().label("Customer's email").required(),
      customerName: commonSchema.name.label("Customer's name"),

      amount: Joi.number().required()
    }),
  }



  return schemas[type]?.validate(data) || {}
}

export const validateObjectId = (id: string) => isValidObjectId(id)

export const uploadFile = async (file: Buffer): Promise<UploadApiResponse | UploadApiErrorResponse | null | undefined> => {
  if (!file) return null
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      // { folder: "reon" },
      function (error, result) {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      },
    );
    toStream(file).pipe(upload);
  });
};


// export const uploadFile = async (uploadedFile: Express.Multer.File): Promise<FileMetadata> => {
//   try {
//     const serviceKey = path.join(__dirname, `../shared/service-acct.json`);
//     console.log("serviceKey", serviceKey);
//     const storage = new Storage({
//       projectId: "guardian-162417",
//       // keyFilename: __dirname + "\\" + "service-acct.json"
//       keyFilename: serviceKey
//     });

//     const customId = `${uploadedFile.originalname + Date.now()}`
//     const file = storage.bucket("gs://guardian-epaper").file(customId)

//     const result = await file.save(uploadedFile.buffer)
//       .then(() => {
//         return file.get().then(data => data)
//       })

//     return { ...result[0].metadata, id: customId };

//   } catch (error) {
//     console.log(error);
//     //@ts-ignore
//     throw new Error(error?.message ?? error?.response?.data?.message);
//   }
// }

// export const deleteFile = async (
//   public_id: string,
// ) => {
//   try {
//     const serviceKey = path.join(__dirname, `../shared/service-acct.json`);
//     const storage = new Storage({
//       projectId: "guardian-162417",
//        // keyFilename: __dirname + "\\" + "service-acct.json"
//        keyFilename: serviceKey
//     });

//     const gcs = storage.bucket("gs://guardian-epaper").file(public_id);
//     const res = await gcs.delete()
//     // console.log(res);
//     return res

//   } catch (error) {
//     //@ts-ignore
//     throw new Error(error?.message ?? error?.response?.data?.message);
//   }
// }

export const deleteFile = (
  public_id: string,
  resource_type = "image",
) => {
  if (!public_id) return null;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(
      public_id,
      { resource_type },
      function (error, result) {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      },
    );
  });
};

export const generateOTP = () => {
  // Generate and send the OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return {
    otp,
    expires: Date.now() + 3600000 //expires in an hour
  }
}


export const generateOTL = () => {
  return {
    otl: randomBytes(20).toString('hex'),
    expires: Date.now() + 3600000 //expires in an hour
    // expires: Date.now() + 300000 
  }
}

//@ts-ignore
export const errorMessage = (error, showLog?: boolean) => {
  if (showLog) {
    console.log(error);
  }
  return { message: error?.message ?? "Something went wrong!" }
}


export const filterUserProfile = (currentUser?: User): User => {
  const data = { ...currentUser };

  //@ts-ignore
  delete data.password;
  return data as User;
};


export function slugify(input: string): string {
  return input
      .toLowerCase() // convert to lowercase
      .trim() // remove leading and trailing whitespaces
      .replace(/\s+/g, '-') // replace whitespaces with hyphens
      .replace(/[^\w\-]+/g, '') // remove non-word characters except hyphens
      .replace(/\-\-+/g, '-') // replace multiple hyphens with single hyphen
      .replace(/^-+/, '') // remove leading hyphens
      .replace(/-+$/, ''); // remove trailing hyphens
}
