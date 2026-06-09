export declare class AppController {
    health(): {
        status: string;
        timestamp: string;
        version: string;
    };
    root(): {
        name: string;
        docs: string;
    };
}
