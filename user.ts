import { getModelForClass } from "@typegoose/typegoose";

class User {
  name!: string;
  email!: string;
  password!: string;
}

export default getModelForClass(User);
