# Desarrollo Móvil Local - MPDS Streetlifting

## 🚀 Configuración Simple

### **IP Configurada**

- **Tu IP**: `192.168.18.63`
- **Frontend**: `http://192.168.18.63:5173`
- **Backend**: `http://192.168.18.63:8000`

## 📱 Para Acceder desde Móvil

### **1. Iniciar Backend**

```bash
cd streetlifting-modern/backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### **2. Iniciar Frontend**

```bash
cd streetlifting-modern/frontend
npm run dev -- --host 0.0.0.0
```

### **3. Acceder desde Móvil**

1. Asegúrate de que tu móvil esté en la misma red WiFi
2. Abre el navegador en tu móvil
3. Ve a: `http://192.168.18.63:5173`

## 🔧 Solución de Problemas

### **Login no funciona en móvil**

1. Verifica que el backend esté corriendo en `0.0.0.0:8000`
2. Verifica que el frontend esté corriendo en `0.0.0.0:5173`
3. Verifica que tu móvil esté en la misma red WiFi

### **Error de conexión**

```bash
# Verificar que el backend responda
curl http://192.168.18.63:8000/health

# Verificar que el frontend responda
curl http://192.168.18.63:5173
```

### **Cambiar IP si es necesario**

Edita `frontend/src/config/environment.ts`:

```typescript
apiBaseUrl = "http://TU_NUEVA_IP:8000";
```

## 📋 Checklist

- [ ] Backend corriendo en `0.0.0.0:8000`
- [ ] Frontend corriendo en `0.0.0.0:5173`
- [ ] IP configurada en `environment.ts`
- [ ] Móvil en la misma red WiFi
- [ ] Acceso desde móvil a `http://192.168.18.63:5173`

---

_Desarrollo Móvil Local - Sin ngrok_
