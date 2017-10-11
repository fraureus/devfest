import 'polymer/polymer-element.html';
import 'polymer/lib/elements/dom-repeat.html';
import 'iron-icon/iron-icon.html';
import 'iron-flex-layout/iron-flex-layout.html';
import 'shadycss/apply-shim.html';
import 'marked-element/marked-element.html';
import '../../fonts/devfest-fonts.html';
import '../../icons/devfest-icons.html';
import '../../components/devfest-footer/devfest-footer.js';
import '../../components/devfest-button/devfest-button.js';
import './devfest-connect-ticket-page.html';
import QrCode from 'qrcode-reader';
import contentLoaderMixin from '../../../content-loader/content-loader-mixin.js';
import marked from 'marked';
window.marked = window.marked || marked;

const {Polymer} = window;

class DevfestConnectTicketPage extends contentLoaderMixin(Polymer.Element) {
  static get is () { return 'devfest-connect-ticket-page'; }

  static get properties () {
    return {
      perks: {
        type: Array,
        value: []
      },
      details: {
        type: Array,
        value: []
      },
      payment: {
        type: Array,
        value: []
      }
    };
  }

  constructor () {
    super();
    this._qr = new QrCode();
    this._qr.callback = (error, result) => {
      if (error) {
        return console.log(error);
      }

      console.log(result.result);
    };

    console.log('hello')
    this._boundResize = this._boundResize || this.resize.bind(this);
    window.addEventListener('resize', this._boundResize);
  }

  connectedCallback () {
    super.connectedCallback();
    console.log('hello2')

    Polymer.RenderStatus.afterNextRender(this, () => {
      var video = this.shadowRoot.querySelector('#video');
      // Get access to the camera!
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        console.log(navigator.mediaDevices.getSupportedConstraints());
        // Not adding `{ audio: true }` since we only want video now
        navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: "environment" } } }).then((stream) => {
          video.src = window.URL.createObjectURL(stream);
          video.play();
          // setTimeout(function() {console.log(video.videoHeight)}, 1000)
        }).catch((error) => {
          console.error(error)
          // Raven.captureException(error)
          // this.$.toast.show(error.message, 5000);
        });
      }
      this.resize();
    });
  }

  resize () {
    // this.$$('#uploading-dialog').center();
    var canvas = this.shadowRoot.querySelector('#canvas');
    var video = this.shadowRoot.querySelector('#video');
    var size = this.windowSize();
    if (canvas && video) {
      this.height = size.height - 240;
      this.width = size.width - 80;
      video.height = this.height;
      video.width = this.width;
      canvas.height = this.height;
      canvas.width = this.width;
    }
  }

  windowSize () {
    var width = 0;
    var height = 0;
    if (window && document) {
      if (typeof window.innerWidth === 'number') {
        // Non-IE
        width = window.innerWidth;
        height = window.innerHeight;
      } else if (document.documentElement && (
        document.documentElement.clientWidth ||
        document.documentElement.clientHeight)) {
        // IE 6+ in 'standards compliant mode'
        width = document.documentElement.clientWidth;
        height = document.documentElement.clientHeight;
      } else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
        // IE 4 compatible
        width = document.body.clientWidth;
        height = document.body.clientHeight;
      }
    }
    return { width: width, height: height };
  }

  scanned () {
    // App.Shell.showMessage('Scan start', function () { App.Shell.closeToast() }, 'Close', null, 10000)
    var video = this.shadowRoot.querySelector('#video');
    var canvas = this.shadowRoot.querySelector('#canvas');
    var context = canvas.getContext('2d');

    var width2 = (video.videoWidth * this.height) / video.videoHeight;
    var height2 = (video.videoHeight * this.width) / video.videoWidth;

    if (height2 > this.height) {
      context.drawImage(video, (this.width - width2) / 2, 0, width2, this.height);
    } else {
      context.drawImage(video, 0, (this.height - height2) / 2, this.width, height2);
    }

    var dataURL = canvas.toDataURL();
    this._qr.decode(dataURL);
    // this._qr.decode(`http://localhost:5000/images/test.png`);
  }

  connectedCallback () {
    super.connectedCallback();
    this.reload();
  }

  reload () {}
}

window.customElements.define(DevfestConnectTicketPage.is, DevfestConnectTicketPage);

export default DevfestConnectTicketPage;
