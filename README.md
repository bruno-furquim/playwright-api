# playwright-api

![Playwright Tests](https://github.com/${{ github.repository }}/actions/workflows/playwright.yml/badge.svg)

Automação de testes de API utilizando Playwright Test

## Visão Geral
Este projeto automatiza testes de API do serviço [Restful Booker](https://restful-booker.herokuapp.com/apidoc/index.html#api-Booking) usando Playwright, com geração dinâmica de dados via Faker e boas práticas de isolamento e validação.

## Estrutura do Projeto
- `tests/booking.spec.ts`: Testes completos de CRUD para reservas (Booking), com dados aleatórios e validações detalhadas.
- `tests/utils/api.ts`: Função utilitária para obtenção de token de autenticação.
- `playwright.config.ts`: Configuração do Playwright, incluindo baseURL e browsers suportados.

## Pré-requisitos
- Node.js 18+
- Dependências instaladas:
  ```sh
  npm install
  ```

## Executando os Testes
Para rodar todos os testes:
```sh
npx playwright test
```

Para rodar um teste específico:
```sh
npx playwright test tests/booking.spec.ts
```

## Geração de Dados
Os testes utilizam a biblioteca [@faker-js/faker](https://fakerjs.dev/) para gerar dados aleatórios e realistas a cada execução, garantindo independência e robustez.

## Relatórios e Traces no CI
Após a execução no GitHub Actions, baixe os artefatos `playwright-report` e `playwright-traces` na aba de artefatos do workflow para análise detalhada dos testes e troubleshooting.

Localmente, após rodar:
```sh
npx playwright show-report
```

## Boas Práticas Adotadas
- **Testes independentes:** Cada teste cria e limpa seus próprios dados.
- **Token único por suíte:** O token de autenticação é obtido uma única vez por suíte de testes.
- **Validações detalhadas:** Todos os campos relevantes das respostas são validados.
- **Cleanup garantido:** Dados criados são removidos mesmo em caso de falha.
- **Dados dinâmicos:** Uso de Faker para evitar colisões e garantir variedade.
- **Uso de test.step:** Para rastreabilidade e clareza do fluxo dos testes.

## Referências
- [Documentação oficial Playwright - API Testing](https://playwright.dev/docs/api-testing)
- [Restful Booker API Docs](https://restful-booker.herokuapp.com/apidoc/index.html#api-Booking)

---

Sinta-se à vontade para adaptar os testes para outros endpoints ou fluxos!