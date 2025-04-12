export interface ticket{
    ticket_id: number,
    fulfiller_id: number|null,
    item_id: number,
    need_by: Date,
    buyer_id: number,
}

export interface item{
    item_id: number,
    item_name: string,
    src_country: string,
    link: string,
    price_us: number,
    price_src: number,
    timestamp: Date,
    image_link: string,
}