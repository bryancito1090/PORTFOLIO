import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';
import { I18nService } from '../../../application/services/i18n.service';

@Component({
  selector: 'app-contact-section',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './contact-section.component.html',
  styleUrl: './contact-section.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactSectionComponent {
  protected readonly i18n = inject(I18nService);

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

    // Simulación de envío con confirmación visual inmediata
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.isSuccess.set(true);
    }, 600);
  }

  resetForm(): void {
    this.contactForm.reset();
    this.isSuccess.set(false);
    this.errorMessage.set(null);
  }
}
