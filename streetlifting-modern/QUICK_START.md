# 🚀 StreetLifting Modern - Quick Start

## Scripts de Inicio Rápido

### Para macOS/Linux:

```bash
# Hacer ejecutable el script
chmod +x run.sh

# Iniciar todo (backend + frontend)
./run.sh

# Solo configurar dependencias
./run.sh --setup

# Solo backend
./run.sh --backend

# Solo frontend
./run.sh --frontend

# Detener servidores
./run.sh --kill
```

### Para Windows (PowerShell):

```powershell
# Iniciar todo (backend + frontend)
.\run.ps1

# Solo configurar dependencias
.\run.ps1 -Setup

# Solo backend
.\run.ps1 -Backend

# Solo frontend
.\run.ps1 -Frontend

# Detener servidores
.\run.ps1 -Kill
```

## 🎯 Uso Rápido

1. **Primera vez:**

   ```bash
   ./run.sh --setup  # Configura todo
   ./run.sh          # Inicia servidores
   ```

2. **Uso diario:**

   ```bash
   ./run.sh          # Inicia todo
   ```

3. **Detener:**
   ```bash
   ./run.sh --kill   # Detiene todo
   ```

## 📱 URLs de Acceso

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

## 🔧 Requisitos Previos

- **Python 3.8+**
- **Node.js 16+**
- **npm**

## 🆘 Solución de Problemas

### Error de puertos ocupados:

```bash
./run.sh --kill  # Limpia puertos
./run.sh         # Reinicia
```

### Error de dependencias:

```bash
./run.sh --setup  # Reinstala todo
```

### Ver logs:

Los scripts muestran información detallada del proceso de inicio.

---

**¡Listo para entrenar! 💪**
