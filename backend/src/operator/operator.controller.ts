import { Controller, Get, Header, Res } from "@nestjs/common";
import { Response } from "express";
import { readFileSync } from "fs";
import { join } from "path";

@Controller()
export class OperatorController {
  @Get("operator")
  @Header("X-Frame-Options", "DENY")
  @Header(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self' https:"
  )
  serve(@Res() res: Response) {
    const path = join(__dirname, "operator.html");
    const html = readFileSync(path, "utf8");
    res.type("html").send(html);
  }
}
