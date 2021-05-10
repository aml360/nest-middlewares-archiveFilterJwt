import { Injectable, NestMiddleware } from '@nestjs/common';
import { parse } from 'cookie';
import { Response, Request } from 'express';

type MiddConfig = {
  /** The url that the client will be redirected if he have not permission */
  returnUrl: string;
  /** The jwt key which is used to sign the jwt */
  jwt_secret: string;
  /** How your cookie that stores the jwt for auth is called */
  jwt_name: string;
  /**
   * Api prefix with slash
   * @example /nest or /api or /backend
   */
  apiPrefix: string;
  /**Definición de los modulos js (angular) y los roles con los que se puede acceder */
  modulos: { [key: string]: string };
};

@Injectable()
export class MyMiddleware implements NestMiddleware {
  static config: MiddConfig;
  /**
   * This function had to be called before using the Middleware
   * @param config Config object
   */
  public static configure(config: MiddConfig) {
    this.config = config;
    Object.keys(this.config.modulos).forEach((k) => {
      this.config.modulos[k] = `/${this.config.modulos[k]}`;
    });
  }
  constructor() {
    if (MyMiddleware.config === undefined) {
      throw new Error('Configure function not called before middleware usage');
    }
  }

  use(req: Request, res: Response, next: Function) {
    const cnf = MyMiddleware.config;
    const URL = req.baseUrl;

    /**Definición de los modulos js (angular) y los roles con los que se puede acceder */
    // const MODULOS = {
    //   '/modules-activity-activity-module.js': 'ADMIN',
    // };
    //Petición api
    if (URL.indexOf(cnf.apiPrefix) === 0) {
      next();
    }
    //Petición web
    else if (cnf.modulos[URL]) {
      var cookieStr = req.headers.cookie;
      var cookies = cookieStr ? parse(cookieStr) : {};
      //Comprobar que esta el jwt en cookies
      if (!cookies[cnf.jwt_name]) {
        return res.redirect(cnf.returnUrl);
      }
      //Validar JWT
      // if (!this.authGuard.canActivate(cookies[cnf.jwt_name], cnf.jwt_secret)) {
      //   return res.redirect(MyMiddleware.config.returnUrl);
      // }
      next();
    } else {
      next();
    }
  }
}
