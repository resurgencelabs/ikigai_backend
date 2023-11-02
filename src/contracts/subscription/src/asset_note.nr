use dep::aztec::{
    note::{
        note_header::NoteHeader,
        note_interface::NoteInterface,
        utils::compute_siloed_note_hash,
    },
    oracle::{
        get_secret_key::get_secret_key,
        get_public_key::get_public_key,
        rand::rand,
    },
    context::PrivateContext,
    state_vars::set::Set,
    log::emit_encrypted_log,
    hash::pedersen_hash,
};

global ASSET_NOTE_LEN: Field = 7;

// Stores an asset
struct AssetNote {
    owner: Field,
    project: Field,
    tier: Field,
    expiry: Field,
    code: Field,
    beneficiary: Field,
    randomness: Field,
    header: NoteHeader,
}

impl AssetNote {
    pub fn new(owner: Field, project: Field, tier: Field, expiry: Field, code: Field, beneficiary: Field) -> Self {
        let randomness = rand();
        AssetNote {
            owner,
            project,
            tier,
            expiry,
            code,
            beneficiary,
            randomness,
            header: NoteHeader::empty(),
        }
    }

    pub fn serialize(self) -> [Field; ASSET_NOTE_LEN]{
        [self.owner, self.project, self.tier, self.expiry, self.code, self.beneficiary, self.randomness]
    }

    pub fn compute_note_hash(self) -> Field {
        // TODO(#1205) Should use a non-zero generator index.
        pedersen_hash(self.serialize(), 0)
    }

    pub fn compute_nullifier(self) -> Field {
        let siloed_note_hash = compute_siloed_note_hash(AssetNoteMethods, self);
        let secret = get_secret_key(self.owner);
        // TODO(#1205) Should use a non-zero generator index.
        pedersen_hash([
            siloed_note_hash,
            secret.low,
            secret.high,
        ],0)
    }

    pub fn set_header(&mut self, header: NoteHeader) {
        self.header = header;
    }

    // Broadcasts the note as an encrypted log on L1.
    pub fn broadcast(self, context: &mut PrivateContext, slot: Field) {
        let encryption_pub_key = get_public_key(self.owner);
        emit_encrypted_log(
            context,
            (*context).this_address(),
            slot,
            encryption_pub_key,
            self.serialize(),
        );
    }
}

fn deserialize(serialized: [Field; ASSET_NOTE_LEN]) -> AssetNote {
    AssetNote {
        owner: serialized[0],
        project: serialized[1],
        tier: serialized[2],
        expiry: serialized[3],
        code: serialized[4],
        beneficiary: serialized[5],
        randomness: serialized[6],
        header: NoteHeader::empty(),
    }
}

fn serialize(note: AssetNote) -> [Field; ASSET_NOTE_LEN]{
    note.serialize()
}

fn compute_note_hash(note: AssetNote) -> Field {
    note.compute_note_hash()
}

fn compute_nullifier(note: AssetNote) -> Field {
    note.compute_nullifier()
}

fn get_header(note: AssetNote) -> NoteHeader {
    note.header
}

fn set_header(note: &mut AssetNote, header: NoteHeader) {
    note.set_header(header);
}

// Broadcasts the note as an encrypted log on L1.
fn broadcast(context: &mut PrivateContext, slot: Field, note: AssetNote) {
    note.broadcast(context, slot);
}

global AssetNoteMethods = NoteInterface {
    deserialize,
    serialize,
    compute_note_hash,
    compute_nullifier,
    get_header,
    set_header,
    broadcast,
};