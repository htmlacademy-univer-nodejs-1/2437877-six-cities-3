import axios from 'axios';
import {RentalOffer} from './domain/rent/RentalOffer.js';

async function fetchAvailableData(url: string): Promise<RentalOffer[]> {
  const availableData: RentalOffer[] = [];
  let i = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const response = await axios.get<RentalOffer>(`${url}/${i}`);
      const data = response.data;
      data.publishDate = new Date(data.publishDate);
      availableData.push(data);
      i++;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
        break;
      } else {
        throw error;
      }
    }
  }
  return availableData;
}

function getRandomElement<T>(array: T[]): T {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

export async function generateUniqueRentalOffers(n: number, url: string): Promise<RentalOffer[]> {
  const availableData = await fetchAvailableData(url);

  const generatedData: RentalOffer[] = [];
  for (let i = 0; i < n; i++) {
    const uniqueOffer = new RentalOffer(
      getRandomElement(availableData).title,
      getRandomElement(availableData).description,
      getRandomElement(availableData).publishDate,
      getRandomElement(availableData).city,
      getRandomElement(availableData).previewImage,
      getRandomElement(availableData).photos,
      getRandomElement(availableData).isPremium,
      getRandomElement(availableData).isFavorite,
      getRandomElement(availableData).rating,
      getRandomElement(availableData).housingType,
      getRandomElement(availableData).rooms,
      getRandomElement(availableData).guests,
      getRandomElement(availableData).price,
      getRandomElement(availableData).facilities,
      getRandomElement(availableData).author,
      getRandomElement(availableData).commentsCount,
      getRandomElement(availableData).coordinates
    );

    generatedData.push(uniqueOffer);
  }

  return generatedData;
}