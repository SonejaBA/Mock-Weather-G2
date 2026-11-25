//expected format { day: string, high: number, low: number }
export default function formatWeather(weather) {
    const formattedWeather = `${weather.day}\nLow: ${weather.low}°F\nHigh: ${weather.high}°F`;

    return formattedWeather;
}