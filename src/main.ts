#!/usr/bin/env node
import {Command} from 'commander';
import {projectVersion} from './version.js';
import {parseTsvToRentalOffers} from './tsvRentalOffersParser.js';
import chalk from 'chalk';
import {RentalOffer} from './domain/rent/RentalOffer.js';
import axios from 'axios';
import * as fs from 'node:fs';
const program = new Command();

program
  .description(chalk.blue('Программа для подготовки данных для REST API сервера.'))
  .usage('--<command> [--arguments]')
  .version(projectVersion, '--version', 'выводит номер версии')
  .helpOption('--help', chalk.red('печатает этот текст'))
  .helpCommand(false);


async function generateData(n: number, url: string): Promise<RentalOffer[]> {
  const generatedData: RentalOffer[] = [];

  for (let i = 0; i < n; i++) {
    const response = await axios.get<RentalOffer>(`${url}/${i}`);
    const data = response.data;
    data.publishDate = new Date(data.publishDate);
    data.price = Math.floor(Math.random() * 1000);
    generatedData.push(data);
  }

  return generatedData;
}

function saveDataToFile(data: RentalOffer[], filepath: string) {
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
    offer.author.name,
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
    const data = await generateData(n, url);
    saveDataToFile(data, filepath);
  });

program
  .command('import')
  .argument('<filepath>', 'импортирует данные из TSV')
  .action(async (filepath:string) => {
    const data = await parseTsvToRentalOffers(filepath);
    console.log(data);
  });

await program.parseAsync(process.argv);
