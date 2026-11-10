import { Component, computed, signal } from '@angular/core';

interface Beat {
  id: number;
  title: string;
  genre: string;
  bpm: number;
  key?: string;
  audioUrl: string;
  coverStyle: string;
  colors: [string, string];
}

interface CartItem {
  title: string;
  price: number;
  type: string;
}

interface LicensePlan {
  id: string;
  title: string;
  price: number | null;
  label: string;
  features: string[];
  featured?: boolean;
}

interface Collaborator {
  name: string;
  country: string;
  image: string;
}

type CheckoutStep = 'details' | 'review';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
})
export class AppComponent {
  readonly currentYear = new Date().getFullYear();
  readonly licensePlans: LicensePlan[] = [
    {
      id: 'basica',
      title: 'Licencia Básica',
      price: 39.99,
      label: 'Para lanzar tu proyecto',
      features: ['MP3 sin marca de agua', 'Uso comercial limitado', 'Hasta 15 000 reproducciones', 'Hasta 5 000 copias'],
    },
    {
      id: 'premium',
      title: 'Licencia Premium',
      price: 59.99,
      label: 'MP3 + WAV',
      features: ['MP3 y WAV sin marca de agua', 'Distribución en plataformas', 'Para estrenos digitales', 'Hasta 100 000 reproducciones'],
    },
    {
      id: 'stems',
      title: 'Premium + Stems',
      price: 99.99,
      label: 'Para una mezcla a medida',
      features: ['MP3, WAV y stems', 'Incluye licencia Premium', 'Pistas separadas para producción', 'Ideal para mezcla y masterización'],
      featured: true,
    },
    {
      id: 'ilimitada',
      title: 'Licencia Ilimitada',
      price: 199.99,
      label: 'Mayor alcance comercial',
      features: ['MP3, WAV y stems', 'Monetización y uso comercial', 'Reproducciones ilimitadas', 'Uso en videos musicales'],
    },
    {
      id: 'exclusiva',
      title: 'Licencia Exclusiva',
      price: null,
      label: 'Cotización personalizada',
      features: ['Licencia exclusiva', 'Condiciones a la medida', 'Consulta sobre distribución', 'Derechos acordados con Eguiz'],
    },
  ];

  readonly collaborators: Collaborator[] = [
    { name: 'Zodaa', country: 'Artista venezolano', image: '/images/zodaa-artist.jpg' },
    { name: 'MIgui', country: 'Artista venezolano', image: '/images/migui-artist.jpg' },
    { name: 'Premo', country: 'Artista de Jamaica', image: '/images/premo-artist.jpg' },
    { name: 'Kalzaa', country: 'Artista venezolano', image: '/images/kalzaa-artist.jpg' },
    { name: 'Dripz', country: 'Artista venezolano', image: '/images/dripz-artist.jpg' },
  ];
  readonly collaboratorIndex = signal(0);

  readonly beats: Beat[] = [
    { id: 1, title: 'Verde', genre: 'Reggaetón', bpm: 100, audioUrl: '/audio/reggaeton-verde-100-bpm.mp3', coverStyle: 'cover--ripple', colors: ['#38e8b3', '#0a5776'] },
    { id: 2, title: 'Turia', genre: 'Reggaetón', bpm: 84, key: 'A minor', audioUrl: '/audio/reggaeton-turia-84-bpm.mp3', coverStyle: 'cover--sunrise', colors: ['#fd6298', '#6932af'] },
    { id: 3, title: 'Luces Neón', genre: 'Reggaetón', bpm: 79, audioUrl: '/audio/reggaeton-luces-neon-79-bpm.mp3', coverStyle: 'cover--grid', colors: ['#23e7ed', '#4332ae'] },
    { id: 4, title: 'Feid Type Beat', genre: 'Afrobeat', bpm: 102, audioUrl: '/audio/afrobeat-feid-102-bpm.mp3', coverStyle: 'cover--sunset', colors: ['#ffb43b', '#a82552'] },
    { id: 5, title: 'Agostofrio', genre: 'Afrobeat', bpm: 118, audioUrl: '/audio/afrobeat-agostofrio-118-bpm.mp3', coverStyle: 'cover--pulse', colors: ['#b2f957', '#16988c'] },
    { id: 6, title: 'Neivan', genre: 'R&B / Pop', bpm: 105, audioUrl: '/audio/rnb-neivan-105-bpm.mp3', coverStyle: 'cover--moon', colors: ['#df9aff', '#4434a0'] },
    { id: 7, title: 'Beranito Lindo', genre: 'Afrobeat', bpm: 98, audioUrl: '/audio/afrobeat-beranito-lindo-98-bpm.mp3', coverStyle: 'cover--flora', colors: ['#f3db57', '#339454'] },
    { id: 8, title: 'Premo', genre: 'Dancehall', bpm: 103, key: 'E minor', audioUrl: '/audio/dancehall-premo-103-bpm.mp3', coverStyle: 'cover--heat', colors: ['#ff734e', '#931e71'] },
    { id: 9, title: 'Si Estaríamos', genre: 'Synthwave', bpm: 91, audioUrl: '/audio/synthwave-si-estariamos-91-bpm.mp3', coverStyle: 'cover--horizon', colors: ['#ff68c9', '#473cdc'] },
  ];

  readonly genres = ['Todos', ...new Set(this.beats.map((beat) => beat.genre))];
  readonly activeGenre = signal('Todos');
  readonly filteredBeats = computed(() => {
    const genre = this.activeGenre();
    return genre === 'Todos' ? this.beats : this.beats.filter((beat) => beat.genre === genre);
  });
  readonly selectedBeat = signal<Beat | null>(null);
  readonly isPlaying = signal(false);
  readonly currentTime = signal(0);
  readonly duration = signal(0);
  readonly playerError = signal('');
  readonly cart = signal<CartItem[]>([]);
  readonly cartCount = computed(() => this.cart().length);
  readonly cartTotal = computed(() => this.cart().reduce((total, item) => total + item.price, 0));
  readonly isCartOpen = signal(false);
  readonly checkoutStep = signal<CheckoutStep>('details');
  readonly customerEmail = signal('');
  readonly customerPhone = signal('');
  readonly orderConfirmed = signal(false);
  readonly notice = signal('');
  readonly paypalBusinessEmail = 'lopezeguisdavid@gmail.com';

  private readonly audio = new Audio();
  private playbackRequest = 0;
  private noticeTimeout: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    this.audio.preload = 'metadata';
    this.audio.addEventListener('timeupdate', () => this.currentTime.set(this.audio.currentTime));
    this.audio.addEventListener('loadedmetadata', () => this.duration.set(this.audio.duration));
    this.audio.addEventListener('ended', () => this.isPlaying.set(false));
    this.audio.addEventListener('error', () => {
      this.playbackRequest++;
      this.isPlaying.set(false);
      this.playerError.set('No se pudo cargar el audio. Comprueba que el sitio se sirve desde Angular.');
      console.error('Error al cargar el beat:', this.audio.error);
    });
  }

  setGenre(genre: string): void {
    this.activeGenre.set(genre);
  }

  async playBeat(beat: Beat): Promise<void> {
    if (this.selectedBeat()?.id === beat.id) {
      await this.togglePlayback();
      return;
    }

    this.audio.pause();
    this.playbackRequest++;
    this.currentTime.set(0);
    this.duration.set(0);
    this.playerError.set('');
    this.selectedBeat.set(beat);
    this.audio.src = beat.audioUrl;
    this.audio.load();
    await this.startAudio();
  }

  async togglePlayback(): Promise<void> {
    if (!this.selectedBeat()) return;
    if (this.audio.paused) {
      await this.startAudio();
      return;
    }

    this.audio.pause();
    this.playbackRequest++;
    this.isPlaying.set(false);
  }

  addToCart(title: string, price: number, type = 'Licencia básica'): void {
    this.cart.update((items) => [...items, { title, price, type }]);
    this.showNotice('Añadido al carrito', title);
  }

  selectLicense(plan: LicensePlan): void {
    if (plan.price === null) {
      this.showNotice('Licencia exclusiva', 'Solicita una cotización para acordar los derechos y el precio.');
      return;
    }

    this.addToCart(plan.title, plan.price, plan.title);
  }

  artistOffset(index: number): number {
    const count = this.collaborators.length;
    const half = Math.floor(count / 2);
    const relativeIndex = (index - this.collaboratorIndex() + count) % count;
    return relativeIndex > half ? relativeIndex - count : relativeIndex;
  }

  artistPositionClass(index: number): string {
    const offset = this.artistOffset(index);
    if (offset === 0) return 'artist-card--active';
    if (offset === -1) return 'artist-card--previous';
    if (offset === 1) return 'artist-card--next';
    if (offset < 0) return 'artist-card--far-previous';
    return 'artist-card--far-next';
  }

  moveCarousel(direction: -1 | 1): void {
    const count = this.collaborators.length;
    this.collaboratorIndex.update((index) => (index + direction + count) % count);
  }

  onCarouselKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.moveCarousel(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.moveCarousel(1);
    }
  }

  removeFromCart(index: number): void {
    this.cart.update((items) => items.filter((_, itemIndex) => itemIndex !== index));
    this.orderConfirmed.set(false);
  }

  openCart(): void {
    this.isCartOpen.set(true);
    this.checkoutStep.set('details');
    this.orderConfirmed.set(false);
  }

  closeCart(): void {
    this.isCartOpen.set(false);
  }

  continueToReview(event: SubmitEvent): void {
    event.preventDefault();
    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) return;
    const formData = new FormData(form);
    this.customerEmail.set(String(formData.get('email') ?? '').trim());
    this.customerPhone.set(String(formData.get('phone') ?? '').trim());
    this.orderConfirmed.set(false);
    this.checkoutStep.set('review');
  }

  paypalItemName(item: CartItem): string {
    return `${item.title} — ${item.type}`;
  }

  paypalCustomerDetails(): string {
    return `Email: ${this.customerEmail()} | Teléfono: ${this.customerPhone()}`;
  }

  confirmOrder(event: Event): void {
    this.orderConfirmed.set((event.target as HTMLInputElement).checked);
  }

  formatTime(seconds: number): string {
    const safeSeconds = Number.isFinite(seconds) ? Math.floor(seconds) : 0;
    const minutes = Math.floor(safeSeconds / 60).toString().padStart(2, '0');
    const remainder = (safeSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainder}`;
  }

  formatPrice(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  private async startAudio(): Promise<void> {
    const request = ++this.playbackRequest;
    this.playerError.set('');
    this.isPlaying.set(true);
    try {
      await this.audio.play();
    } catch (error) {
      if (request !== this.playbackRequest) return;
      this.isPlaying.set(false);
      this.playerError.set('No se pudo reproducir el beat. Vuelve a intentarlo.');
      console.error('Error al reproducir el beat:', error);
    }
  }

  private showNotice(title: string, detail: string): void {
    this.notice.set(`${title}: ${detail}`);
    clearTimeout(this.noticeTimeout);
    this.noticeTimeout = setTimeout(() => this.notice.set(''), 3500);
  }
}
