//expected format { day: string, high: number, low: number }
export default function formatWeather(weather) {
    const formattedWeather = `Low: ${weather.low}°F | High: ${weather.high}°F`;

    return formattedWeather;
}