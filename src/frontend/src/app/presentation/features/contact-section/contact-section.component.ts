import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { I18nService } from '../../../application/services/i18n.service';
import { GuestbookComponent } from '../guestbook/guestbook.component';
import { NOTIFY_WEBHOOK_URL } from '../../../core/tokens/notify-config.token';

@Component({
  selector: 'app-contact-section',
  standalone: true,
  imports: [ReactiveFormsModule, GuestbookComponent],
  templateUrl: './contact-section.component.html',
  styleUrl: './contact-section.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactSectionComponent {
  protected readonly i18n = inject(I18nService);
  private readonly http = inject(HttpClient);
  private readonly notifyWebhookUrl = inject(NOTIFY_WEBHOOK_URL);

  // Estado reactivo del formulario con Signals
  protected readonly isSubmitting = signal(false);
  protected readonly isSuccess = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  // Definición del FormGroup reactivo tipado
  protected readonly contactForm = new FormGroup({
    fullNameOrCompany: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)]
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),
    phone: new FormControl('', {
      nonNullable: true
    }),
    serviceType: new FormControl('', {
      nonNullable: true
    }),
    projectDetails: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(10)]
    })
  });

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      this.errorMessage.set(this.i18n.t().contactFormError);
      return;
    }

    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    const formData = this.contactForm.getRawValue();

    this.http.post(this.notifyWebhookUrl, {
      eventType: 'CONTACT_FORM',
      senderName: formData.fullNameOrCompany,
      senderContact: formData.email + (formData.phone ? ` | Tel: ${formData.phone}` : ''),
      serviceType: formData.serviceType || 'General',
      message: formData.projectDetails
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.isSuccess.set(true);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.isSuccess.set(true);
      }
    });
  }

  resetForm(): void {
    this.contactForm.reset();
    this.isSuccess.set(false);
    this.errorMessage.set(null);
  }
}
