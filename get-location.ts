  async tryGeolocation() {
    try {
      if (await this.diagnostic.isLocationAuthorized()) {
        if (await this.diagnostic.isLocationEnabled()) {
          this.loading = this.loadingCtrl.create({
            content: 'Localizando ofertas...'
          });
          this.loading.present();
          const {coords} = await this.geolocation.getCurrentPosition();
          this.lat = coords.latitude;
          this.lng = coords.longitude;
          let token = await this.storage.get('token');
          let getOffers = await this.getOffersPromise(this.lat, this.lng, token);
          if (getOffers['status'] === "OK") {
            let offers: Offer[] = getOffers['result'];
            this.availableOffers = offers;
            this.currentPosition = 2;
            this.stackOffers = this.availableOffers.slice(0, this.currentPosition);
          }
          this.loading.dismiss().then(r => {
            this.showText = true;
          });
        } else {
          this.activateGPS(true);
        }
      } else {
        await this.diagnostic.requestRuntimePermission(this.diagnostic.permission.ACCESS_FINE_LOCATION);
        this.tryGeolocation();
      }
    } catch (e) {
      this.loading.dismiss();
      if (e.status == 403) {
        this.refreshToken();
      } else if (e.status == 404) {
        this.showText = true;
        this.presentToast("Lo siento, no hemos encontrado oportunidades cerca de ti");
      } else {
        this.presentToast("Upss! Ha ocurrido un error.Inténtalo de nuevo");
      }
    }
  }

  activateGPS(fromAndroid) {
    let title, message;
    if (fromAndroid) {
      title = `Activa tu GPS`;
      message = `Miles de ofertas te están esperando, necesitamos que actives tu GPS y VUELVE!`;
    } else {
      title = `Dale Permisos de ubicación`;
      message = `Miles de ofertas te están esperando, dale click en la url y VUELVE!`;
    }

    let confirm = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {
            this.navCtrl.pop();
          }
        },
        {
          text: 'Aceptar',
          handler: () => {
            if (fromAndroid) {
              this.navCtrl.pop().then(() => this.diagnostic.switchToLocationSettings())
            } else {
              this.navCtrl.pop();
            }

          }
        }
      ]
    });
    confirm.present();
  }
