import { Injectable } from '@nestjs/common';
import xml2js from 'xml2js';
@Injectable()
export class Xml2objectService {
  async convertXmlToObject(xmlData: string): Promise<any> {
    // xml2js 파서 인스턴스를 생성합니다.
    const parser = new xml2js.Parser({ explicitArray: false });

    try {
      // xml2js의 parseStringPromise 메소드를 사용하여 XML을 객체로 비동기 변환합니다.
      // 여기서 async/await 패턴을 사용합니다.
      const result = await parser.parseStringPromise(xmlData);
      return result;
    } catch (error) {
      throw new Error('XML 파싱 중 오류 발생: ' + error.message);
    }
  }
}
