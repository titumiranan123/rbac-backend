"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, cookie_parser_1.default)());
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: false,
        transform: false,
        forbidNonWhitelisted: false,
    }));
    const configService = app.get(config_1.ConfigService);
    const corsOrigin = configService.get('CORS_ORIGIN') || 'http://localhost:3000';
    app.enableCors({ origin: corsOrigin, credentials: true });
    const port = configService.get('PORT') || '3000';
    const host = '0.0.0.0';
    await app.listen(port, host);
    console.log(`Application is running on: http://${host}:${port}/api`);
}
void bootstrap();
//# sourceMappingURL=main.js.map