BrowserUIUtils.trimURL = function trimURL(aURL) {
      let urlString = this.removeSingleTrailingSlashFromURL(aURL);
      try {
        const url = new URL(urlString);
        if (/(http|https):/.test(url.protocol)) {
          if (url.host.startsWith("www")) {
            url.host = url.host.slice(4);
          }
          return url.host;
        } else {
          return urlString;
        }
      } catch (err) {
        return urlString;
      }
    }