export function removeVietnameseTones(str) {
    if (!str) return '';

    str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    str = str.replace(/đ/g, 'd').replace(/Đ/g, 'D');

    return str.toLowerCase();
}

export function searchMatch(text, searchTerm) {
    if (!searchTerm) return true;

    const normalizedText = removeVietnameseTones(text);
    const normalizedSearch = removeVietnameseTones(searchTerm);

    return normalizedText.includes(normalizedSearch);
}