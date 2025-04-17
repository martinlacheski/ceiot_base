# Ejercicio CiberKillChain - Defensa

# Alumno

**Lic. Martín Lacheski**  
📡 Especialización en Internet de las Cosas (IoT)  
🏛️ Universidad de Buenos Aires (UBA)

---

## 🔐 Plan de Defensa – Orden Inverso de la Cyber Kill Chain

## 🔍 **Descripción**

Este ejercicio presenta un plan que describe las medidas de detección y mitigación ante ciberataques en el sistema **EnviroSense**, utiliza la lógica inversa de la Cyber Kill Chain. Para cada etapa del ataque, se identifican técnicas del framework **MITRE ATT&CK** y los controles de seguridad aplicados para prevenir, detectar o contener amenazas. **El objetivo es mostrar una defensa proactiva y estructurada**, adecuada a un sistema IoT crítico con sensores, actuadores y arquitectura en la nube.

### Objetivos del plan de defensa:

- Prevenir accesos no autorizados
- Detectar anomalías en tiempo real
- Contener impactos en sensores/actuadores
- Recuperar operaciones rápidamente

---

## 🎯 **Objetivo de la Defensa**

Implementar una estrategia de defensa por capas para detectar, mitigar y responder eficazmente a ciberataques en **EnviroSense**, con el objetivo de proteger la integridad de los datos, la disponibilidad de los actuadores y la seguridad de la infraestructura en la nube.

---

### 1 - **Actions on Objectives (Acción sobre el Objetivo)**

**Objetivo del atacante:**

Sabotear sensores y actuadores, manipular datos, inutilizar el sistema.

**Técnicas de ataque utilizadas:**

- **_T1531_ – Account Access Removal**  
  https://attack.mitre.org/techniques/T1531/

  - **💥 Ataque:** Eliminación de cuentas válidas para negar acceso.

  - **🕵️‍♂️ Detección:** Establecer registros de alertas ante operaciones como updateUser, dropUser, deleteUser en MongoDB. 

  - **🛡️ Mitigación:** Implementar **AWS IAM Access Analyzer** para detectar cambios críticos en permisos. Establecer separación de roles de usuarios con permisos mínimos.  

  - **🛠️ Técnica utilizada:** _M1026_ –  Privileged Account Management  
  https://attack.mitre.org/mitigations/M1026/  


- **_T1565_ – Data Manipulation**  
  https://attack.mitre.org/techniques/T1565/

  - **💥 Ataque:** Modificación maliciosa de datos sin eliminar evidencia.

  - **🕵️‍♂️ Detección:** Implementar revisión de logs de cambios de estado en MongoDB. Realizar la comparación de backups. Desplegar **AWS GuardDuty** para anomalías en la **instancia EC2**.

  - **🛡️ Mitigación:** Validación de entradas en endpoints y lógica de negocio. 

  - **🛠️ Técnica utilizada:**  _M1054_ –  Software Configuration  
  https://attack.mitre.org/mitigations/M1054/  

---

### 2 - **Command & Control (C2)**

**Objetivo del atacante:**

Canal remoto para ejecutar comandos y mantener acceso.

**Técnicas de ataque utilizadas:**

- **_T1572_ – Protocol Tunneling**  
  https://attack.mitre.org/techniques/T1572/

  - **💥 Ataque:** Uso de túneles para evadir detección (ej. SSH reverso).

  - **🕵️‍♂️ Detección:** Monitorización de puertos no estándar y tráfico anómalo. Configurar **AWS Network Firewall** con reglas para bloquear tráfico **SSH/HTTP** entrante y saliente no autorizado.

  - **🛡️ Mitigación:** Bloquear tráfico saliente en EC2 salvo a dominios específicos. 

  - **🛠️ Técnica utilizada:** _M1037_ –  Filter Network Traffic  
  https://attack.mitre.org/mitigations/M1037/ 

- **_T1105_ – Ingress Tool Transfer**  
  https://attack.mitre.org/techniques/T1105/

  - **💥 Ataque:** Transferencia de archivos/malware al sistema.

  - **🕵️‍♂️ Detección:** Detección de comandos como curl, wget, scp en logs. Habilitar **Amazon Inspector** para escanear archivos maliciosos en la **instancia EC2**.

  - **🛡️ Mitigación:** Uso obligatorio de cifrado **(TLS/SSL)** y escaneo de archivos en ingreso.

  - **🛠️ Técnica utilizada:** _M1041_ –  Encrypt Sensitive Information  
  https://attack.mitre.org/mitigations/M1041/ 

---

### 3 - **Installation (Persistencia en el Sistema)**

**Objetivo del atacante:**

 Instalar backdoors, shells, tareas programadas.

**Técnicas de ataque utilizadas:**

- **_T1053.003_ – Scheduled Task/Job: Cron**  
  https://attack.mitre.org/techniques/T1053/003/

  - **💥 Ataque:** Configurar un Cron job malicioso.

  - **🕵️‍♂️ Detección:** Realizar auditorias y revisiones de **/etc/crontab** y **/etc/cron.d/**.

  - **🛡️ Mitigación:** Auditoría y alertas ante creación de tareas. Solo root puede modificarlas. Usar **AWS Systems Manager (SSM)** para gestionar cron jobs centralizados (evita modificaciones locales). 

  - **🛠️ Técnica utilizada:** _M1047_ –  Audit   
  https://attack.mitre.org/mitigations/M1047/ 

- **_T1543.003_ – Create or Modify System Process: Systemd Service**  
  https://attack.mitre.org/techniques/T1543/003/

  - **💥 Ataque:** Instalar un servicio en systemd para lograr persistencia.

  - **🕵️‍♂️ Detección:** Monitoreo de cambios en **/etc/systemd/system**. Revisión de Logs del sistema.

  - **🛡️ Mitigación:** Solo el usuario root puede modificar servicios. Restringir el uso del sistema.

  - **🛠️ Técnica utilizada:** _M1022_ –  Restrict File and Directory Permissions  
  https://attack.mitre.org/mitigations/M1022/ 

- **_T1505.003_ – Server Software Component: Web Shell**  
  https://attack.mitre.org/techniques/T1505/003/

  - **💥 Ataque:** Crear endpoint que permita una **web shell** para ejecutar comandos.

  - **🕵️‍♂️ Detección:** Detección de archivos nuevos o modificaciones en la estructura del proyecto.

  - **🛡️ Mitigación:** Firmas digitales, control de integridad en el backend.

  - **🛠️ Técnica utilizada:** _M1045_ –  Code Signing  
  https://attack.mitre.org/mitigations/M1045/ 

---

### 4 - **Exploitation (Ejecución del Ataque)**

**Objetivo del atacante:**

Ejecutar código malicioso vía endpoints vulnerables.

**Técnicas de ataque utilizadas:**

- **__T1078_ – Valid Accounts**  
  https://attack.mitre.org/techniques/T1078/

  - **💥 Ataque:** Robar y hacer uso de cuentas legítimas.

  - **🕵️‍♂️ Detección:** Análisis de inicios de sesión desde IPs inusuales y de otra zona geográfica. Detección de uso fuera de horario normal.

  - **🛡️ Mitigación:** Uso de 2FA, rotación de tokens, acceso mínimo por rol, rotación automática de credenciales con **AWS Secrets Manager**. 

  - **🛠️ Técnica utilizada:** _M1026_ –  Privileged Account Management   
  https://attack.mitre.org/mitigations/M1026/ 

- **_T1059.004_ – Command and Scripting Interpreter: Unix Shell**  
  https://attack.mitre.org/techniques/T1059/004/

  - **💥 Ataque:** Enviar payloads con código malicioso para ejecutar en el servidor.

  - **🕵️‍♂️ Detección:** Revisión de Logs de bash en **instancia EC2**. Establecer alertas ante ejecución de **chmod +x**, **curl**.

  - **🛡️ Mitigación:** Protección contra ejecución arbitraria. Inputs validados en FastAPI con Pydantic y Beanie.

  - **🛠️ Técnica utilizada:** _M1050_ –  Exploit Protection  
  https://attack.mitre.org/mitigations/M1050/ 

---

### 5 - **Delivery (Entrega del Ataque)**

**Objetivo del atacante:**

Enviar phishing con enlace a sitio falso.

**Técnicas de ataque utilizadas:**

- **_T1566.002_ – Phishing: Spearphishing Link**  
  https://attack.mitre.org/techniques/T1566/002/

  - **💥 Ataque:** Enviar enlaces maliciosos en correos electrónicos para capturar credenciales.

  - **🕵️‍♂️ Detección:** En la red institucional establecer registros de acceso a sitios web desconocidos o dominios que no forman parte de la navegación habitual.

  - **🛡️ Mitigación:** Realizar campañas de concientización sobre seguridad, navegación segura y prevención de phishing.

  - **🛠️ Técnica utilizada:** _M1017_ –  User Training   
  https://attack.mitre.org/mitigations/M1017/ 

---

### 6 - **Weaponization (Armado del Ataque)**

**Objetivo del atacante:**

Identificar información sensible del sistema a partir de fuentes públicas, como el sitio institucional y los repositorios, para analizar la infraestructura, endpoints y usuarios. Con esa información, se puede crear un sitio falso y preparar un ataque de phishing.

**Técnicas utilizadas:**

- **_T1592.002_ – Gather Victim Identity Information: Email Addresses**  
  https://attack.mitre.org/techniques/T1592/002/

  - **🧠 Técnica:** Recolección de correos electrónicos institucionales para uso en phishing.

  - **🕵️‍♂️ Detección:** Alertas de scraping en el sitio institucional. Generar alertas a través del monitoreo de accesos repetitivos.

  - **🛡️ Mitigación:** Utilizar sistemas de prevención de intrusiones (IPS) y herramientas que bloqueen o limiten el acceso a direcciones IP, dominios o contenidos maliciosos como phishing y malware.

  - **🛠️ Técnica utilizada:** _M1031_ –  Network Intrusion Prevention   
  https://attack.mitre.org/mitigations/M1031/ 

- **_T1593_ – Search Open Websites/Domains**  
  https://attack.mitre.org/techniques/T1593/

  - **🧠 Técnica:** Búsqueda de información sensible en repositorios públicos y páginas web.

  - **🕵️‍♂️ Detección:** Controlar el repositorio de GitHub (exposición de endpoints, certificados y secretos). Usar **GitGuardian** para escanear secretos en el repositorio.

  - **🛡️ Mitigación:** Auditoría de repositorios. Configurar escaneo de secretos, utilizar repositorio privado o ramas privadas.

  - **🛠️ Técnica utilizada:** _M1047_ –  Audit   
  https://attack.mitre.org/mitigations/M1047/ 

---

### 7 - **Reconnaissance (Reconocimiento)**

**Objetivo:**

Prevenir la exposición de información sensible y detectar intentos de recolección de datos, de manera de reducir los intentos de ataques.

**Técnicas utilizadas:**

- **_T1592.002_ – Gather Victim Identity Information**  
  https://attack.mitre.org/techniques/T1592/002/

  - **🧠 Técnica:** Búsqueda de correos institucionales, nombres de usuarios y roles organizacionales a través de sitios web públicos, redes sociales y documentos expuestos.

  - **🕵️‍♂️ Detección:** Realizar un monitoreo de patrones de scraping en el sitio web institucional. Implementar alertas por accesos repetitivos a páginas de contacto o directorios.

  - **🛡️ Mitigación:** Reemplazar correos electrónicos visibles por formularios de contacto seguros con CAPTCHA. Limitar la publicación de información organizacional sensible.

    - **🛠️ Técnica utilizada:** _M1017_ –  User Training   
  https://attack.mitre.org/mitigations/M1017/ 

- **_T1593_ – Search Open Websites/Domains**  

  - **🧠 Técnica:** Análisis de repositorios públicos (GitHub), documentos compartidos y foros técnicos para encontrar credenciales, endpoints o configuraciones expuestas.

  - **🕵️‍♂️ Detección:** Realizar escaneo automatizado de repositorios en busca de secretos expuestos.

  - **🛡️ Mitigación:** Configurar repositorios como privados. Rotar credenciales potencialmente expuestas.

  - **🛠️ Técnica utilizada:** _M1047_ –  Audit   
  https://attack.mitre.org/mitigations/M1047/ 

---

## ✅ Conclusión

El presente plan de defensa demuestra cómo aplicar la lógica inversa de la Cyber Kill Chain permite identificar puntos críticos de ataque y establecer controles específicos y eficaces en cada fase 🎯. En entornos IoT como EnviroSense, donde confluyen hardware, software y servicios en la nube, una estrategia de seguridad proactiva y multicapa es fundamental 🔐.

La implementación de controles basados en MITRE ATT&CK, el uso de servicios como AWS GuardDuty, Inspector y SSM, junto con buenas prácticas de desarrollo seguro y entrenamiento de usuarios, permiten construir un ecosistema más resiliente frente a amenazas 🛡️🧠.

    La ciberdefensa no es un evento, sino un proceso continuo de vigilancia, adaptación y mejora constante. 🚀👨‍💻🌐