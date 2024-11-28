#!/usr/bin/env node
import 'reflect-metadata';
import {Command} from 'commander';
import {projectVersion} from './version.js';
import {parseTsvToRentalOffers, RentalOfferWithUser} from './tsvRentalOffersParser.js';
import chalk from 'chalk';
import * as fs from 'node:fs';
import {generateUniqueRentalOffers} from './MockDataGenerator.js';
import {container} from './infrastructure/container.js';
import {IUserService} from './DAL/databaseService.js';
import {TYPES} from './infrastructure/types.js';
import {DatabaseClient} from './infrastructure/Database/database-client.interface.js';
import {RentalOfferDbo} from './DAL/rentalOfferDbo.js';
import {RentalOfferService} from './DAL/rentalOfferService.js';
import mongoose from 'mongoose';

const program = new Command();

program
  .description(chalk.blue('Программа для подготовки данных для REST API сервера.'))
  .usage('--<command> [--arguments]')
  .version(projectVersion, '--version', 'выводит номер версии')
  .helpOption('--help', chalk.red('печатает этот текст'))
  .helpCommand(false);


function saveDataToFile(data: RentalOfferWithUser[], filepath: string) {
  const tsvData = data.map((offer) => [
    offer.title,
    offer.description,
    offer.publishDate.toISOString(),
    offer.city,
    offer.previewImage,
    offer.photos.join(','),
    offer.isPremium,
    offer.isFavorite,
    offer.rating,
    offer.housingType,
    offer.rooms,
    offer.guests,
    offer.price,
    offer.facilities.join(','),
    offer.author.id,
    offer.author.name,
    offer.author.email,
    offer.author.password,
    offer.author.userType,
    offer.author.avatar,
    offer.commentsCount,
    offer.coordinates.join(',')
  ].join('\t')).join('\n');

  fs.writeFileSync(filepath, tsvData);
}


program
  .command('generate')
  .argument('<n>','')
  .argument('<filepath>','')
  .argument('<url>','')
  .action(async (n:number, filepath:string, url:string)=>{
    const data = await generateUniqueRentalOffers(n, url);
    saveDataToFile(data, filepath);
  });

program
  .command('import')
  .argument('<filepath>', 'импортирует данные из TSV')
  .argument('<dbUrl>', 'URL базы данных')
  .action(async (filepath:string, dbUrl:string) => {
    const data = await parseTsvToRentalOffers(filepath);

    const db = container.get<DatabaseClient>(TYPES.DatabaseClient);
    await db.connect(dbUrl);

    const rentalOfferService = container.get<RentalOfferService>(TYPES.RentalOfferService);
    const userService = container.get<IUserService>(TYPES.UserService);

    for (const databaseClientElement of data) {
      const offer = new RentalOfferDbo(databaseClientElement);
      try {
        const existingUser = await userService.findByEmail(databaseClientElement.author.email);
        if(existingUser){
          offer.author._id = new mongoose.Types.ObjectId(existingUser.id);
        }else {
          const {id} = await userService.create(databaseClientElement.author);
          offer.author = new mongoose.Types.ObjectId(id);
        }
      }catch (e) { /* empty */ }

      try {
        await rentalOfferService.create(offer);
      }catch (e) { /* empty */ }

    }

  });

await program.parseAsync(process.argv);
