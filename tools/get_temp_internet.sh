# Definimos las siguientes variables para utilizar:

# Ingresamos la posicion GPS (Latitud y Longitud)
LAT=-00.000000
LON=-00.000000

# Ingresamos la APIKEY de la cuenta openweathermap
APIKEY= SOMEKEY

# Ingresamos el ID y la KEY del dispositivo virtual
ID=Virtual001 
KEYDEVICE=VirtualKEY001

# Ejecutamos la API y guardamos en el archivo .txt
wget -O temp_internet.txt "https://api.openweathermap.org/data/2.5/weather?lat=$LAT&lon=$LON&APPID=$APIKEY&units=metric&exclude=current"


# Extraemos del archivo temp_internet.txt los valores necesarios para enviar al post_measurement.sh
JSON_FILE="temp_internet.txt"

# Extraigo temperatura, humedad y presión atmosférica
TEMP=$(jq '.main.temp' $JSON_FILE)
HUMIDITY=$(jq '.main.humidity' $JSON_FILE)
PRESSURE=$(jq '.main.pressure' $JSON_FILE)

#Ejecutamos el POST
wget -O - --method=POST http://localhost:8080/virtual/measurement --body-data="id=$ID&key=$KEYDEVICE&t=$TEMP&h=$HUMIDITY&p=$PRESSURE"

#Ejecutamos la obtencion de mediciones y actualizamos el output.txt
sh get_json_measurements.sh

#Visualizamos como quedan los archivos
cat temp_internet.txt | jq .
cat output.txt | jq .