import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

function validateDate(date: string) {
  const parsedDate = new Date(date);
  return parsedDate instanceof Date && !isNaN(parsedDate as any);
}

@Injectable()
export class AppointmentValidationPipe implements PipeTransform {
  transform(value: any) {
    const { date, time } = value;
    if (date && !validateDate(date)) {
      throw new BadRequestException('Invalid date format');
    }
    if (time && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      throw new BadRequestException('Invalid time format');
    }
    return value;
  }
} 