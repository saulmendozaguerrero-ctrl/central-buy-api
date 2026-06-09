import { ConfigService } from '@nestjs/config';
export declare class PriceImportJob {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    importPlattsData(): Promise<void>;
}
