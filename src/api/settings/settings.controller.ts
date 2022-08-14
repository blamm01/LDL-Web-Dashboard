import { Controller, Get } from '@nestjs/common';

@Controller('api/settings')
export class SettingsController {
    @Get()
    root() {
        return "hi";
    }
}