import * as ErrorCard from './error'
import * as NSFWCard from './nsfwWarning'
import * as TopCard from './top'
import * as AuthorCard from './author'
import * as DetailCard from './detail'
import * as IllustCard from './illust'
import * as ResavingCard from './resaving'

export namespace cards {
    export const error = ErrorCard.main;
    export const nsfw = NSFWCard.main;
    export const top = TopCard.main;
    export const author = AuthorCard.main;
    export const detail = DetailCard.main;
    export const illust = IllustCard.main;
    export const resaving = ResavingCard.main;
}
