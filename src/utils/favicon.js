export function getFaviconUrl(url) {
    try{
        const domain = new URL(url).hostname;

        if (domain.includes("localhost")) {
            return "/icons/localhost.svg";
        }
        return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
    } catch {
        return "icons/globe.svg";
    }
}