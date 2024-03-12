import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Xml2objectService } from 'src/xml2object/xml2object.service';
import _ from 'lodash';

@Injectable()
export class KopisapiService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly xml2objectService: Xml2objectService,
  ) {}

  private readonly serviceKey: string = this.configService.get('SERVICE_KEY');

  getDateString(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  async getEvents(page: number, rows: number) {
    const now = new Date();
    const threeMonthLater = new Date(now.setMonth(now.getMonth() + 3));
    const url = `http://www.kopis.or.kr/openApi/restful/pblprfr?service=${this.serviceKey}&stdate=${this.getDateString(now)}&eddate=${this.getDateString(threeMonthLater)}&rows=${rows}&cpage=${page}&prfstate=01&newsql=Y`;
    const response = await this.httpService.axiosRef.get(url);
    try {
      const result = await this.xml2objectService.convertXmlToObject(
        response.data,
      );
      return result.dbs.db;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getEventDetail(mt20id: string) {
    const url = `http://www.kopis.or.kr/openApi/restful/pblprfr/${mt20id}?service=${this.serviceKey}&newsql=Y`;
    const response = await this.httpService.axiosRef.get(url);
    try {
      const result = await this.xml2objectService.convertXmlToObject(
        response.data,
      );
      return result.dbs.db;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getVenueDetail(mt10id: string) {
    const url = `http://www.kopis.or.kr/openApi/restful/prfplc/${mt10id}?service=${this.serviceKey}&newsql=Y`;
    const response = await this.httpService.axiosRef.get(url);
    try {
      const result = await this.xml2objectService.convertXmlToObject(
        response.data,
      );
      return result.dbs.db;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  parseEventTimeStr(eventTimeStr: string): any {
    let eventTime = eventTimeStr.replace(/\s/g, '').split('),')[0]; // 너무 많으니까 첫번째 요소만 가져오자
    let [day, timesStr] = eventTime.split('('); // 요일과 시간들 분리
    day = day.split('~')[0];
    const times = timesStr.replace(/\)/g, '').split(',');
    return { day, times }; // {'월요일', ['12:00', '16:00']}
  }

  findDatesOfEvent(dayAndTimes: any, startDate: Date, endDate: Date): Date[] {
    const result = [];
    const days = [
      '일요일',
      '월요일',
      '화요일',
      '수요일',
      '목요일',
      '금요일',
      '토요일',
    ];

    let { day, times } = dayAndTimes;
    day = day == undefined ? '' : day.replace(/\s/g, '');
    const paramDayIdx = days.indexOf(day);
    let currentDate = new Date(startDate.getTime());

    while (currentDate <= endDate) {
      const dayIdx = currentDate.getDay(); // 현재 요일의 인덱스, 예를 들어 1
      if (dayIdx === paramDayIdx) {
        times.forEach((time) => {
          const [hour, min] = time.replace(/\s/g, '').split(':').map(Number); // '12:00' -> 12, 0
          const tmp = new Date(currentDate);
          tmp.setHours(hour, min, 0, 0); // 시간 설정
          result.push(tmp);
        });
      }
      currentDate.setDate(currentDate.getDate() + 1); // 날짜 증가
    }

    return result;
  }
}
