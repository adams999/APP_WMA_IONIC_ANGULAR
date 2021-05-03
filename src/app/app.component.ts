import { Component, NgZone } from '@angular/core';
import { Platform, AlertController, NavController, MenuController, ToastController, LoadingController, ModalController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router } from '@angular/router';
import { IlsadminService } from './providers/ilsadmin.service';
//import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Network } from '@ionic-native/network/ngx';
import { AppRoutingModule } from './app-routing.module';
import { AppUpdate } from '@ionic-native/app-update/ngx';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['./app.scss']
})

export class AppComponent {
  //@ViewChild(Router) router : Router;
  public disconnect: boolean;
  public color = '#00799c';
  public userType;
  public logo;
  public loadLogo = false;
  public versionsHttpGet;
  public versionApp;
  public versionAppA;
  public fechaHttp: String = new Date().toISOString();
  public fechaActual: String = new Date().toISOString();
  public pages;
  public prefijoApp: any = 'WM';
  public plataforma: any;
  public versionCode: any;
  public colorText;
  public colorMenu;
  public langPredef = 'spa';
  public cliente = {
    "client": "WORLD MEDIC ASSIST",
    "id_country": "US",
    "img_cliente": "id_client358201706161748511298.png",
    "web": "https://worldmedicassist.com",
    "urlPrueba": "https://worldmedicassist.com",
    "prefix": "WM",
    "type_platform": "1",
    "id_broker": "15",
    "email": "info@worldmedicassist.com",
    "colors_platform": "{ \"COLOR_MENU_BACKEND\": \"#ee2738\", \"color_tr_table\": \"#bababa\", \"color_font_tr\": \"#e6e1e1\", \"color_login\": \"#f6f6f6\", \"color_menu\": \"#7276b5\", \"color_menu_barra\": \"#212121\", \"color_menu_barra_hover\": \"#7f7f7f\", \"color_font_tab\": \"#5c595a\", \"color_email_font\": \"#065c96\", \"email_shadow_table\": \"#f9f9f9\" }"
  };
  public backButtonApp: any;
  //rootPage:any = this.paginaSession();

  constructor(public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public alertCtrl: AlertController,
    public ilsAdminProvider: IlsadminService,
    //private backgroundMode: BackgroundMode,
    public appVersion: AppVersion,
    public network: Network,
    public ngZone: NgZone,
    public appRoutingModule: AppRoutingModule,
    public navCtrl: NavController,
    public route: Router,
    public menuCtrl: MenuController,
    public appUpdate: AppUpdate,
    public toastController: ToastController,
    public loadingController: LoadingController,
    public translate: TranslateService,
    public modalCtrl: ModalController) {
    let colores = JSON.parse(this.cliente.colors_platform);
    let textColor: any = localStorage.getItem('paramAgency');
    if (textColor != 'N/A' && textColor != null) {
      this.colorText = JSON.parse(localStorage.getItem('paramAgency')).color_fuente;
    } else {
      this.colorText = 'white';
    }

    this.sessionColores(colores, this.cliente);
    localStorage.setItem('prefixApp', this.prefijoApp);
    this.pages = this.appRoutingModule.validadorPag();

    if (localStorage.getItem('userType')) {
      navCtrl.navigateRoot('/list-orders');
    } else if (!localStorage.getItem('userType')) {
      navCtrl.navigateRoot('/login/WM');
    }

    this.initializeApp(localStorage.getItem('COLOR_MENU_BACKEND'));
    this.paramTranslate();

    this.userType = localStorage.getItem('userType');
    this.logo = localStorage.getItem('logo');
    if (this.userType) {
      this.color = localStorage.getItem('COLOR_MENU_BACKEND');
    } else {
      this.color = '#00799c';
    }

    network.onDisconnect().subscribe(() => {
      //aqui si el menu esta activo lo cierro y lo desactivo
      this.menuCtrl.close();
      this.menuCtrl.swipeGesture(false);
      this.modalCtrl.dismiss();
      // Aqui se detecta si no hay conexion de internet se mostrara la pagina de network como root
      navCtrl.navigateRoot('/network-page');
      ngZone.run(() => { this.disconnect = true; });
    });

    network.onConnect().subscribe(() => {
      //aqui vuelvo a activar el menu cuando exista conexion internet
      this.menuCtrl.swipeGesture(true);
      // Si se detecta que hay internet vuelve a mostrarse la navegacion normal 
      this.userType ? this.navCtrl.navigateRoot('/list-orders') : navCtrl.navigateRoot('/login/WM');;
      ngZone.run(() => { this.disconnect = false; });
    });

    this.funcSalirApp();
  }

  funcSalirApp() {
    this.backButtonApp = this.platform.backButton.subscribeWithPriority(666666, async () => {
      const alertExit = await this.alertCtrl.create({
        header: this.translate.instant('SALIR_APP.salir_app'),
        buttons: [
          {
            text: this.translate.instant('SALIR_APP.si'),
            handler: ((salir) => {
              navigator['app'].exitApp();
            })
          },
          {
            text: this.translate.instant('SALIR_APP.no'),
          }
        ]
      });

      alertExit.present();
    });
  }

  paramTranslate() {
    this.translate.addLangs(['eng', 'spa']);
    this.translate.setDefaultLang(this.langPredef);
    const browserLang = localStorage.getItem('lang_app') ? localStorage.getItem('lang_app') : this.langPredef;
    this.translate.use(browserLang.match(/eng|spa|por|fra|deu/) ? browserLang : this.langPredef);
  }

  initializeApp(color) {
    if (localStorage.getItem('themeDark') == 'true') {//aqui aplico el thema dark si esta activo 
      document.body.classList.toggle('dark', true);
      this.colorMenu = '#121212';
    } else {
      this.colorMenu = localStorage.getItem('COLOR_MENU_BACKEND');
    }
    //this.backgroundMode.enable();
    this.platform.ready().then(() => {
      //this.statusBar.styleDefault();
      //this.statusBar.styleLightContent();
      if (this.platform.is('ios') || this.platform.is('iphone') || this.platform.is('ipad')) {
        this.plataforma = 'IOS';
        localStorage.setItem('platfApp', 'IOS');
        //PARA COLOCAR COLOR DE BARRA DE ESTADO EN UN COLOR ESPECIFICO EN IOS overlaysWebView DEBE IR EN FALSO Y backgroundColorByHexString EN HEXADECIMAL DEL COLOR
        this.statusBar.styleLightContent();
        //this.statusBar.overlaysWebView(false);
        this.splashScreen.hide();
      }
      else if (this.platform.is('android')) {
        this.plataforma = 'AND';
        localStorage.setItem('platfApp', 'AND');
        this.statusBar.backgroundColorByHexString(color);
        this.splashScreen.hide();
        // if (!color) {
        //   this.statusBar.backgroundColorByHexString(this.color);
        //   this.splashScreen.hide();
        // }
      } else {
        localStorage.setItem('platfApp', 'DEV');
      }

      //comparar la version de la app si mostrar aviso para que se actualize a la version mas nueva
      this.appVersion.getVersionNumber()
        .then(value => {
          this.versionAppA = value;
          this.versionApp = this.reemplazarTodo(value, '.', '');
          localStorage.setItem('versionAppApi', value);
          localStorage.setItem('versionApp', this.versionApp);
        }).catch(err => {
          localStorage.setItem('versionAppApi', 'DEV');
        });

      this.upgradeNativo();
      this.versionCode = this.appVersion.getVersionCode() + '.' + this.appVersion.getVersionNumber();
      console.log(this.versionCode)
    }).catch(() => {
      localStorage.setItem('platfApp', 'DEV');
    });

  }

  openPage(page, title) {
    // aqui paso el nombre de la pagina al navegador de ionic desde el menu
    if (page == 'contacto') { //paso el parametro del titulo traducido
      this.navCtrl.navigateRoot([page + '/' + this.translate.instant('ROUTING.' + title)]);
    } else {
      this.navCtrl.navigateRoot([page]);
    }
    this.menuCtrl.close();
  }

  reemplazarTodo(text, busca, reemplaza) {
    while (text.toString().indexOf(busca) != -1)
      text = text.toString().replace(busca, reemplaza);
    return text;
  }

  hoyFecha() {
    var hoy = new Date();
    let dd = (hoy.getDate() < 10 ? '0' : '') + hoy.getDate();
    let mm = ((hoy.getMonth() + 1) < 10 ? '0' : '') + (hoy.getMonth() + 1);
    let yyyy = hoy.getFullYear();
    let fechaDeHoy = yyyy + '-' + mm + '-' + dd;
    return fechaDeHoy;
  }

  loadlogo($event) {
    this.loadLogo = true;
    //console.log(this.loadLogo)
  }

  sessionColores(colorsPlatform, cliente) {
    if (localStorage.getItem('paramAgency') != 'N/A' && localStorage.getItem('paramAgency')) {
      localStorage.setItem("COLOR_MENU_BACKEND", JSON.parse(localStorage.getItem('paramAgency')).color_principal);
      localStorage.setItem("color_menu_barra_hover", JSON.parse(localStorage.getItem('paramAgency')).color_secundario);
      if (localStorage.getItem('platfNew') && localStorage.getItem('platfNew') == 'Y') {
        localStorage.setItem("logo", localStorage.getItem('urlPlatform') + '/app/admin/images/brokers/paramters/' + localStorage.getItem('agencyMaster') + '/' + JSON.parse(localStorage.getItem('paramAgency')).logo_empresa);
      } else {
        localStorage.setItem("logo", localStorage.getItem('urlPlatform') + '/app/upload_files/broker_parameters/' + localStorage.getItem('agencyMaster') + '/logos/' + JSON.parse(localStorage.getItem('paramAgency')).logo_empresa);
      }
      localStorage.setItem("nomClient", localStorage.getItem('nombreAgenMaster'));
    } else {
      localStorage.setItem("COLOR_MENU_BACKEND", colorsPlatform.COLOR_MENU_BACKEND);
      localStorage.setItem("color_tr_table", colorsPlatform.color_tr_table);
      localStorage.setItem("color_font_tr", colorsPlatform.color_font_tr);
      localStorage.setItem("color_login", colorsPlatform.color_login);
      localStorage.setItem("color_menu", colorsPlatform.color_menu);
      localStorage.setItem("color_menu_barra", colorsPlatform.color_menu_barra);
      localStorage.setItem("color_menu_barra_hover", colorsPlatform.color_menu_barra_hover);
      localStorage.setItem("color_font_tab", colorsPlatform.color_font_tab);
      localStorage.setItem("color_email_font", colorsPlatform.color_email_font);
      localStorage.setItem("email_shadow_table", colorsPlatform.email_shadow_table);
      localStorage.setItem('pref', 'WM');
      localStorage.setItem("logo", 'https://ilsadmin.com/app/upload_files/logo_clientes/' + this.cliente.img_cliente);
      localStorage.setItem("web", this.cliente.web);
      localStorage.setItem("nomClient", 'WORLD MEDIC ASSIST');
    }
  }

  upgradeNativo() {// Funcion que captura la version de la app nativa y,luego consulta a la api y si hay resultado mayor en la api se descargara la nueva app
    setTimeout(() => {
      this.appVersion.getVersionNumber().then((value) => {
        this.versionAppA = value;
        this.versionApp = this.reemplazarTodo(value, '.', '');
        localStorage.setItem('versionAppApi', value);
        localStorage.setItem('versionApp', this.versionApp);
        this.platform.ready().then(() => {
          if (this.platform.is('android')) {
            this.ilsAdminProvider.checkVersionAppA(localStorage.getItem('prefixApp'), localStorage.getItem('platfApp'))
              .subscribe((data) => {
                console.log(data);
                if (data[0].version) {
                  let versionBD = this.reemplazarTodo(data[0].version, '.', '');
                  if (parseInt(versionBD) > parseInt(this.versionApp)) {
                    this.alertaActualizacion(data[0].version, data[0].descripcion);
                  }
                }
              });
          }
        });
      }).catch((err) => {
        localStorage.setItem('versionAppApi', 'DEV');
      });
    }, 15000);
  }

  async alertaActualizacion(version, desc) {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant('COMPONENT.alert_header') + version,
      subHeader: this.translate.instant('COMPONENT.alert_subHeader'),
      message: '<b>' + this.translate.instant('COMPONENT.alert_message') + '</b><br> ' + desc,
      buttons: [
        {
          text: this.translate.instant('COMPONENT.alert_bOk'),
          handler: ((ok) => {
            const updateUrl = 'https://ilsadmin.com/app/app_agentes/versions/android/xml/' + localStorage.getItem('prefixApp') + '.xml';
            this.appUpdate.checkAppUpdate(updateUrl)
              .then((data) => {
                console.log('Version Nueva Instalando')
              });
          })
        },
        {
          text: this.translate.instant('COMPONENT.alert_bNot')
        }
      ]
    });
    await alert.present();
  }

  async borrarAlmacenamiento() {
    await this.loading(15000, this.translate.instant('COMPONENT.session_out'));

    this.ilsAdminProvider.logoutApp()
      .subscribe((data) => {
        this.elimLocalStorage();
        this.loadingController.dismiss();
        this.alertaToast(this.translate.instant('COMPONENT.session_out_ok'), 1000, true);
        console.log('storage borrado');
      }, (err) => {
        this.loadingController.dismiss();
        this.alertaToast(this.translate.instant('COMPONENT.err_session_out'), 2000, false);
      });
  }

  elimLocalStorage() {
    let so = localStorage.getItem("so");
    let v_so = localStorage.getItem("v_so");
    let manuf = localStorage.getItem("manuf");
    let modelo = localStorage.getItem("modelo");
    let uuid = localStorage.getItem("uuid");
    localStorage.clear();
    localStorage.setItem('so', so);
    localStorage.setItem('v_so', v_so);
    localStorage.setItem('manuf', manuf);
    localStorage.setItem('modelo', modelo);
    localStorage.setItem('uuid', uuid);
  }

  async loading(duration, message) {
    const loading = await this.loadingController.create({
      duration: duration,
      message: message,
    });
    return await loading.present();
  }

  async alertaToast(message, duration, login: boolean) {
    let toast = await this.toastController.create({
      message: message,
      duration: duration,
      position: 'bottom'
    });

    if (login) {
      toast.onDidDismiss()
        .catch(data => document.location.href = 'index.html')
        .then(err => document.location.href = 'index.html');
    }

    toast.present();
  }

}
