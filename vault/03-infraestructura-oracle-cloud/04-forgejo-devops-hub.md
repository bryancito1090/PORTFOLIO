# 04 // FORGEJO — HUB EMPRESARIAL DEVOPS & CI/CD
> *Configuración de app.ini, Forgejo Actions (act_runner), Container Registry y Flujo de Despliegue.*

---

## 1. El Rol de Forgejo en el Ecosistema

**Forgejo** ([`https://git.bryan-bano.com/`](https://git.bryan-bano.com/)) es el centro neurálgico del ciclo de vida del software (SDLC) de Bryan. Aloja el código fuente de este proyecto, gestiona el tablero de tareas (Kanban/Issues), controla la aprobación de Pull Requests y ejecuta las canalizaciones de CI/CD mediante **Forgejo Actions**.

### Ventajas de una Plataforma Auto-alojada:
1. **Soberanía Total de Datos**: El código, variables de entorno, secretos y artefactos no residen en nubes públicas comerciales compartidas.
2. **Cero Límites de Minutos en CI/CD**: A diferencia de los minutos limitados de GitHub Actions, los runners de Forgejo corren localmente en el VPS sin restricciones.
3. **Registro de Contenedores Integrado**: Forgejo incluye un **Container Registry (OCI)** nativo (`git.bryan-bano.com/bryan/...`) que permite almacenar y versionar imágenes Docker de .NET y Angular directamente en el servidor.
4. **Compatibilidad con GitHub Actions**: La sintaxis de los workflows en `.forgejo/workflows/` o `.github/workflows/` es 100% compatible con los estándares de la industria.

---

## 2. Configuración Empresarial de Forgejo (`app.ini`)

Para que Forgejo soporte flujos de trabajo empresariales completos (Actions, Container Registry, Branch Protection y Webhooks), su archivo `app.ini` (o variables en `~/devops/docker-compose.yml`) debe contar con las siguientes secciones habilitadas:

```ini
[server]
APP_DATA_PATH    = /data/forgejo
DOMAIN           = git.bryan-bano.com
SSH_DOMAIN       = git.bryan-bano.com
HTTP_PORT        = 3000
ROOT_URL         = https://git.bryan-bano.com/
DISABLE_SSH      = false
SSH_PORT         = 2222
SSH_LISTEN_PORT  = 2222
LFS_START_SERVER = true

[actions]
ENABLED = true

[packages]
ENABLED = true

[repository]
ROOT = /data/git/repositories
DEFAULT_BRANCH = develop
ENABLE_PUSH_CREATE_USER = true
ENABLE_PUSH_CREATE_ORG = true

[repository.pull_request]
WORK_IN_PROGRESS_PREFIXES = WIP:,[WIP]

[security]
INSTALL_LOCK = true
SECRET_KEY   = <TU_SECRET_KEY>
```

---

## 3. Despliegue del Runner de CI/CD (`act_runner`) en el VPS

Para que Forgejo ejecute los pipelines automáticos de compilación, testing y despliegue, se despliega el contenedor oficial `forgejo/act_runner` dentro de `~/devops/`:

### Archivo `~/devops/docker-compose.runner.yml`:
```yaml
version: '3.8'

services:
  forgejo-runner:
    image: code.forgejo.org/forgejo/runner:13
    container_name: forgejo_act_runner
    restart: always
    environment:
      - GITEA_INSTANCE_URL=http://forgejo:3000
      - GITEA_RUNNER_REGISTRATION_TOKEN=${RUNNER_TOKEN}
      - GITEA_RUNNER_NAME=oracle-rocky-runner-01
      - GITEA_RUNNER_LABELS=ubuntu-latest:docker://node:22-bookworm,dotnet-runner:docker://mcr.microsoft.com/dotnet/sdk:9.0
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./runner-data:/data
    networks:
      - devops_net

networks:
  devops_net:
    external: true
```

### Proceso de Registro del Runner:
1. En Forgejo: Acceder a **Configuración del Sitio (Site Administration)** -> **Actions** -> **Runners** -> **Create new Runner**.
2. Copiar el token generado (`RUNNER_TOKEN`).
3. Registrar el runner desde la terminal:
   ```bash
   sudo docker exec -it forgejo_act_runner act_runner register \
     --instance https://git.bryan-bano.com \
     --token <RUNNER_TOKEN> \
     --no-interactive
   ```

---

## 4. Pipeline de CI/CD para Forgejo (`.forgejo/workflows/pipeline.yml`)

El pipeline empresarial ejecuta validaciones de calidad, compilación y despliegue continuo:

```yaml
name: CI/CD Pipeline - Portfolio Flagship

on:
  push:
    branches:
      - develop
      - main
  pull_request:
    branches:
      - develop
      - main

jobs:
  # 1. Validación de Calidad y Convenciones
  lint-and-validate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Validate Frontend Linter & Build
        run: |
          cd src/frontend
          npm ci
          npm run build -- --configuration development

  # 2. Compilación de Backend .NET (cuando se integre)
  build-backend:
    runs-on: dotnet-runner
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Restore and Build .NET
        run: |
          if [ -f src/backend/Portfolio.sln ]; then
            dotnet restore src/backend/Portfolio.sln
            dotnet build src/backend/Portfolio.sln -c Release --no-restore
          fi

  # 3. Despliegue Automático según Rama
  deploy:
    needs: [lint-and-validate]
    if: github.ref == 'refs/heads/develop' || github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Deployment
        run: |
          echo "Desplegando en ambiente: ${{ github.ref_name }}"
          # Comando de actualización de contenedores o despliegue k3s
```
