export function isDateInPast(firstDate: Date, secondDate: Date): boolean {
    if (firstDate.setHours(0, 0, 0, 0) <= secondDate.setHours(0, 0, 0, 0))
        return true;

    return false;
}
