import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';


@Injectable()
export class SeedService {
  constructor(
    private readonly httpService: HttpService,
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
    
  ) {}

  async executeSeed() {
    try {
      //Borramos la tabla de pokemons antes de insertar
      await this.pokemonModel.deleteMany({}); //delete * from pokemon

      const { data } = await this.httpService.axiosRef.get<PokeResponse>(
        'https://pokeapi.co/api/v2/pokemon?limit=650',
      );

      const pokemonToInsert: { name: string; no: number }[] = [];

      data.results.forEach(async ({ name, url }) => {
        const segments = url.split('/');
        const pokemonNumber: number = +segments[segments.length - 2];
        pokemonToInsert.push({ name, no: pokemonNumber });
      });

      //Insertar por lote en la base de datos
      await this.pokemonModel.insertMany(pokemonToInsert);
      return 'Seed executed';

    } catch (error) {
      console.error(error);
    }
  }
}
