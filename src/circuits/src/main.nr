use crate::note::{
    note_hash::{compute_inner_hash, compute_siloed_hash, compute_unique_hash},
    note_header::NoteHeader,
    note_interface::NoteInterface,
};

fn main(x: Field, y: pub Field) {
    //let compute_note_hash = note_interface.compute_note_hash;
    //let note_hash = compute_note_hash(note);
    //let inner_note_hash = compute_inner_hash(note_header.storage_slot, note_hash);

    //let siloed_note_hash = compute_siloed_hash(note_header.contract_address, inner_note_hash);

    //let unique_siloed_note_hash = compute_unique_hash(note_header.nonce, siloed_note_hash);
    assert(x == y);
}


