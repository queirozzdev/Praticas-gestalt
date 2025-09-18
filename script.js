

// ===== CONFIGURAÇÕES GLOBAIS =====
const CONFIG = {
    maxCommentLength: 500,
    validationDelay: 300, // ms
    loadingDuration: 2000 // ms
};

// ===== ELEMENTOS DO DOM =====
const form = document.getElementById('formTec');
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modal-close');
const btnEnviar = document.getElementById('btnEnviar');
const btnLimpar = document.getElementById('btnLimpar');
const charCount = document.getElementById('char-count');
const comentarios = document.getElementById('comentarios');

// ===== VALIDAÇÃO EM TEMPO REAL (HEURÍSTICA DE NIELSEN: PREVENÇÃO DE ERROS) =====
class FormValidator {
    constructor() {
        this.errors = {};
        this.setupValidation();
    }

    setupValidation() {
        // Validação em tempo real para campos obrigatórios
        this.addRealTimeValidation('nome', this.validateName);
        this.addRealTimeValidation('email', this.validateEmail);
        this.addRealTimeValidation('interesse', this.validateInterest);
        
        // Contador de caracteres para comentários
        this.setupCharacterCounter();
    }

    addRealTimeValidation(fieldId, validator) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        let timeout;
        field.addEventListener('input', () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                this.validateField(fieldId, validator);
            }, CONFIG.validationDelay);
        });

        // Validação ao sair do campo
        field.addEventListener('blur', () => {
            this.validateField(fieldId, validator);
        });
    }

    validateField(fieldId, validator) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(`${fieldId}-error`);
        
        if (!field || !errorElement) return;

        const isValid = validator(field.value);
        
        if (isValid) {
            this.clearError(fieldId);
        } else {
            this.showError(fieldId, this.getErrorMessage(fieldId));
        }
    }

    validateName(value) {
        return value.trim().length >= 2 && /^[a-zA-ZÀ-ÿ\s]+$/.test(value);
    }

    validateEmail(value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    }

    validateInterest(value) {
        return value !== '';
    }

    getErrorMessage(fieldId) {
        const messages = {
            'nome': 'Nome deve ter pelo menos 2 caracteres e conter apenas letras',
            'email': 'Por favor, insira um e-mail válido',
            'interesse': 'Por favor, selecione uma tecnologia de interesse'
        };
        return messages[fieldId] || 'Campo inválido';
    }

    showError(fieldId, message) {
        const errorElement = document.getElementById(`${fieldId}-error`);
        const field = document.getElementById(fieldId);
        
        if (errorElement && field) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
            field.style.borderColor = '#e74c3c';
            this.errors[fieldId] = message;
        }
    }

    clearError(fieldId) {
        const errorElement = document.getElementById(`${fieldId}-error`);
        const field = document.getElementById(fieldId);
        
        if (errorElement && field) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
            field.style.borderColor = '#e1e8ed';
            delete this.errors[fieldId];
        }
    }

    setupCharacterCounter() {
        if (!comentarios || !charCount) return;

        comentarios.addEventListener('input', () => {
            const length = comentarios.value.length;
            charCount.textContent = `${length}/${CONFIG.maxCommentLength}`;
            
            // Mudança de cor baseada no limite
            if (length > CONFIG.maxCommentLength * 0.9) {
                charCount.style.color = '#e74c3c';
            } else if (length > CONFIG.maxCommentLength * 0.7) {
                charCount.style.color = '#f39c12';
            } else {
                charCount.style.color = '#6c757d';
            }
        });
    }

    validateForm() {
        const fields = ['nome', 'email', 'interesse'];
        let isValid = true;

        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field) return;

            const validator = this[`validate${fieldId.charAt(0).toUpperCase() + fieldId.slice(1)}`];
            if (validator && !validator(field.value)) {
                this.showError(fieldId, this.getErrorMessage(fieldId));
                isValid = false;
            }
        });

        return isValid;
    }
}

// ===== GERENCIAMENTO DE ESTADO E FEEDBACK (HEURÍSTICA DE NIELSEN: VISIBILIDADE DO STATUS) =====
class FormManager {
    constructor() {
        this.validator = new FormValidator();
        // Limpar somente após fechar o modal de sucesso
        this.shouldClearOnClose = false;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Envio do formulário
        form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Botão limpar
        btnLimpar.addEventListener('click', () => this.clearForm());
        
        // Modal
        modalClose.addEventListener('click', () => this.closeModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });

        // Fechar modal com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                this.closeModal();
            }
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        // Validação antes do envio
        if (!this.validator.validateForm()) {
            this.showNotification('Por favor, corrija os erros antes de enviar', 'error');
            return;
        }

        // Simulação de envio com feedback visual
        this.showLoadingState();
        
        try {
            // Simular envio para servidor
            await this.simulateSubmission();
            this.showSuccessModal();
        } catch (error) {
            this.showNotification('Erro ao enviar formulário. Tente novamente.', 'error');
        } finally {
            this.hideLoadingState();
        }
    }

    showLoadingState() {
        btnEnviar.classList.add('loading');
        btnEnviar.disabled = true;
    }

    hideLoadingState() {
        btnEnviar.classList.remove('loading');
        btnEnviar.disabled = false;
    }

    async simulateSubmission() {
        return new Promise((resolve) => {
            setTimeout(resolve, CONFIG.loadingDuration);
        });
    }

    showSuccessModal() {
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
        // Marca para limpar o formulário quando o modal for fechado
        this.shouldClearOnClose = true;
        
        // Foco no modal para acessibilidade
        modalClose.focus();
    }

    closeModal() {
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
        // Se veio de um envio bem-sucedido, limpar os dados agora
        if (this.shouldClearOnClose) {
            form.reset();
            this.clearAllErrors();
            this.resetCharacterCounter();
            this.shouldClearOnClose = false;
            // Opcional: devolver foco ao primeiro campo para continuidade
            const firstInput = document.getElementById('nome') || form.querySelector('input, select, textarea, button');
            if (firstInput) firstInput.focus();
        }
    }

    clearForm() {
        if (confirm('Tem certeza que deseja limpar todos os campos?')) {
            form.reset();
            this.clearAllErrors();
            this.resetCharacterCounter();
            this.showNotification('Formulário limpo com sucesso', 'success');
        }
    }

    clearAllErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
            element.classList.remove('show');
        });

        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.style.borderColor = '#e1e8ed';
        });

        this.validator.errors = {};
    }

    resetCharacterCounter() {
        if (charCount) {
            charCount.textContent = '0/500';
            charCount.style.color = '#6c757d';
        }
    }

    showNotification(message, type = 'info') {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Estilos inline para a notificação
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            zIndex: '1001',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        });

        // Cores baseadas no tipo
        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            info: '#3498db'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remover após 3 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// ===== MELHORIAS DE ACESSIBILIDADE =====
class AccessibilityEnhancer {
    constructor() {
        this.setupKeyboardNavigation();
        this.setupAriaLabels();
        this.setupFocusManagement();
    }

    setupKeyboardNavigation() {
        // Navegação por teclado melhorada
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            }
        });
    }

    handleTabNavigation(e) {
        const focusableElements = form.querySelectorAll(
            'input, select, textarea, button, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }

    setupAriaLabels() {
        // Adicionar labels ARIA para melhor acessibilidade
        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            const label = form.querySelector(`label[for="${field.id}"]`);
            if (label && !label.textContent.includes('*')) {
                label.textContent += ' *';
            }
        });
    }

    setupFocusManagement() {
        // Gerenciar foco para elementos dinâmicos
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const focusableElement = node.querySelector('input, button, select, textarea');
                            if (focusableElement) {
                                focusableElement.focus();
                            }
                        }
                    });
                }
            });
        });

        observer.observe(form, { childList: true, subtree: true });
    }
}

// ===== INICIALIZAÇÃO DA APLICAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar gerenciadores
    const formManager = new FormManager();
    const accessibilityEnhancer = new AccessibilityEnhancer();
    
    // Mostrar mensagem de boas-vindas
    console.log('🚀 Formulário de Tecnologias Emergentes carregado com sucesso!');
    console.log('📋 Aplicando princípios da Gestalt, Heurísticas de Nielsen e conceitos de usabilidade');
    
    // Adicionar classe de carregamento completo
    document.body.classList.add('loaded');
});

// ===== UTILITÁRIOS GLOBAIS =====
window.FormUtils = {
    // Função para validar e-mail (pode ser usada externamente)
    validateEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    // Função para formatar dados do formulário
    getFormData: () => {
        const formData = new FormData(form);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        return data;
    },
    
    // Função para exportar dados (simulação)
    exportData: () => {
        const data = window.FormUtils.getFormData();
        console.log('Dados do formulário:', data);
        return data;
    }
};
