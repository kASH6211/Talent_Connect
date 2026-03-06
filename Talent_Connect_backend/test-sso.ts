import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { AuthService } from './src/auth/auth.service';

const msg = "WqEg2mc67rYE5+xPKbbq3aJL8oIsSsdDny5q5lg/6meeU0YL2VcVEXNpqH6idblb2xGQ+TKL6NqL2dOkxR9FsY8McRPVUZxxeUNwIYZsaJvZ5hy/dZ9g3bFcvtP3OBl+Fmd0fAvpyqUESY7RnYuiUVTL3TyEeunIC+38cXW6FOzLqEGddNIw9KnbLPNhmgvPSPM9ZF0322JkK+0WY2G9nht4QiL0QhQe6A+1QQFBIFO0QlnxG3pelJjTOVoQIhg01vMgxuPEaI109B4GjHmkrMI6i2jYlp9DhS74jAdspznzhmnsZGK73GON+RtqIP8jQx6F84Bjez3yOMyC5VdGVVBBPG/ooUXTgRYQahlBZf0sMxnf9P5fnX+PYr9xQgbe2V5ORTcCf+f7R+Xo9CPhlRuqdtRvWvQVxaZpDMUqGN6C0HHWs6BLUIDwvZkqlE/QK4fmgvfF05BHy52e3Uvt8XFsMfeVvZfxHufcu1Vm3Rq+a61Nt5cfw2K1+6yMPuIK";

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const authService = app.get(AuthService);

    console.log("Testing handleSSOCallback with simulated Base64 token payload...");
    try {
        const result = await authService.handleSSOCallback(msg);
        console.log("✅ SSO Callback Success");
        console.log(result);
    } catch (e: any) {
        console.error("❌ SSO Callback Failed");
        console.error(e.message);
    }

    await app.close();
}
bootstrap();
