
use dep::aztec::{
    note::{
        note_header::NoteHeader,
        note_interface::NoteInterface,
        utils::compute_siloed_note_hash,
        note_hash::{compute_inner_hash, compute_siloed_hash, compute_unique_hash},
    },
};
use dep::std;

fn main(x: Field, 
    y: pub Field, 
    owner_: Field, 
    proj_: pub Field, 
    tier_: pub Field, 
    exp_: pub Field, 
    ben_: pub Field, 
    rand_: Field, 
    ctrt_: Field, 
    nonce_: Field,
    uhash_: Field,
    ) {
   
    //let ser_note = [owner_, proj_, tier_, exp_, code_, ben_, rand_];
    //let deserialize = note_interface.deserialize;
    //let set_header = note_interface.set_header;
    //let mut note = deserialize(arr_copy_slice(ser_note, [0; 6], 0));
    //set_header(&mut note, note_header);
    //let compute_note_hash = note_interface.compute_note_hash;
    //let note_hash = compute_note_hash(note);
    //let inner_note_hash = compute_inner_hash(note_header.storage_slot, note_hash);
    //let siloed_note_hash = compute_siloed_hash(ctrt_, inner_note_hash);
    //let unique_siloed_note_hash = compute_unique_hash(nonce_, siloed_note_hash);
    assert(x == y);
    //assert(uhash_ == unique_siloed_note_hash);
}


