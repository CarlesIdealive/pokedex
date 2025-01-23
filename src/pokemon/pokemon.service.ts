import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { isValidObjectId, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    try {
      const newPokemon : CreatePokemonDto = {
        ...createPokemonDto,
        name: createPokemonDto.name.toUpperCase()
      };
      const pokemon = await this.pokemonModel.create(newPokemon);
      return pokemon;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  findAll() {
    return this.pokemonModel.find();
  }


  async findOne(id: string) {
      let pokemon: Pokemon | null = null;
      //Por numero 
      if ( !isNaN(+id) ) 
        pokemon = await this.pokemonModel.findOne({ no: +id });
      //Por el ID de mongo
      if (!pokemon && isValidObjectId(id))
        pokemon = await this.pokemonModel.findById(id);
      //Por nombre
      if (!pokemon)
        pokemon = await this.pokemonModel.findOne({ name: id.toUpperCase().trim() });

      if (!pokemon) 
        throw new NotFoundException(`Pokemon not found - ${id}`);

      return pokemon;
  }

  async update(id: string, updatePokemonDto: UpdatePokemonDto) {
    try {
      const pokemon = await this.findOne(id);
      const updatedPokemon: UpdatePokemonDto = {
        ...updatePokemonDto,
        name: updatePokemonDto.name
          ? updatePokemonDto.name.toUpperCase()
          : undefined,
      };
      await pokemon.updateOne(updatedPokemon);
      return { ...pokemon.toJSON(), ...updatedPokemon };

    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    // try {
    //   const pokemon = await this.findOne(id);
    //   await pokemon.deleteOne();

    // } catch (error) {
    //   this.handleExceptions(error);       
    // }
    // await this.pokemonModel.findByIdAndDelete(id);

    const {deletedCount} = await this.pokemonModel.deleteOne({ _id: id });
    if (deletedCount===0) 
      throw new NotFoundException(`Pokemon not found - ${id}`);
    
    return {deleted: true};
  }


  private handleExceptions( error: any ){
    if (error.code === 11000)
      throw new BadRequestException(
        `Pokemon already exists - ${JSON.stringify(error.keyValue)}`,
      );
    console.log();
    throw new InternalServerErrorException(error);
  }


}
