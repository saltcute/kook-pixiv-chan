import * as ErrorCard from './error'
import * as NSFWCard from './nsfwWarning'
import * as TopCard from './top'
import * as AuthorCard from './author'

export namespace cards {
    export const error = ErrorCard.main;
    export const nsfw = NSFWCard.main;
    export const top = TopCard.main;
    export const author = AuthorCard.main;
}
