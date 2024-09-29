#!/usr/bin/env node
import {Command} from 'commander';
import {projectVersion} from './version.js';
import {parseTsvToRentalOffers} from './tsvRentalOffersParser.js';
const program = new Command();


program
  .description('Программа для подготовки данных для REST API сервера.')
  .usage('--<command> [--arguments]')
  .version(projectVersion, '--version', 'выводит номер версии')
  .helpOption('--help', 'печатает этот текст')
  .helpCommand(false);

program
  .command('--generate <n> <filepath> <url>', 'генерирует произвольное количество тестовых данных');

program
  .command('import')
  .argument('<filepath>', 'импортирует данные из TSV')
  .action(async (filepath:string) => {
    const data = await parseTsvToRentalOffers(filepath);
    console.log(data);
  });

await program.parseAsync(process.argv);
