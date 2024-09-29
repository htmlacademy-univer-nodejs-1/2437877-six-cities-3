#!/usr/bin/env node
import {Command} from 'commander';
import {projectVersion} from './version.js';
import {parseTsvToRentalOffers} from './tsvRentalOffersParser.js';
import chalk from 'chalk';
const program = new Command();

program
  .description(chalk.blue('Программа для подготовки данных для REST API сервера.'))
  .usage('--<command> [--arguments]')
  .version(projectVersion, '--version', 'выводит номер версии')
  .helpOption('--help', chalk.red('печатает этот текст'))
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
