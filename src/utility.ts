/**
 * checks whether the first date is before the second date
 * @param firstDate the first date
 * @param secondDate the second date
 * @returns whether the first date is before the second date
 */
export function isDateInPast(firstDate: Date, secondDate: Date): boolean {
    if (firstDate.setHours(0, 0, 0, 0) <= secondDate.setHours(0, 0, 0, 0))
        return true;

    return false;
}
