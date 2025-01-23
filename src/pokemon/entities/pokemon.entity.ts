import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class Pokemon extends Document {
    //id: string;   //Mongo da el ID unico
    @Prop({
        unique: true,
        index: true
    })
    no: number;     //Numero del pokemon

    @Prop({
        unique: true,
        index: true
    })
    name: string;
    
    url: string;
}

//Eportamos esquema de definiciones
export const PokemonSchema = SchemaFactory.createForClass(Pokemon);
