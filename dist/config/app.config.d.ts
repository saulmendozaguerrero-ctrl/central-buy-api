declare const _default: (() => {
    nodeEnv: string;
    port: number;
    appUrl: string;
    apiUrl: string;
    corsOrigins: string[];
    jwtSecret: string;
    fromEmail: string;
    resendApiKey: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    nodeEnv: string;
    port: number;
    appUrl: string;
    apiUrl: string;
    corsOrigins: string[];
    jwtSecret: string;
    fromEmail: string;
    resendApiKey: string;
}>;
export default _default;
