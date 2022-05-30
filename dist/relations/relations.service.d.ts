import { CreateRelationDto } from "./dto-relation/create-relation.dto";
import { GetRelationFilterDto } from "./dto-relation/get-relation-filter.dto";
import { Relation } from "./relation.entity";
import { RelationRepository } from "./relation.repository";
export declare class RelationsService {
    private relationRepository;
    constructor(relationRepository: RelationRepository);
    createRelation(CreateRelationDto: CreateRelationDto): Promise<Relation>;
    getRelationById(id: number): Promise<Relation>;
    getRelation(FilterDto: GetRelationFilterDto): Promise<Relation[]>;
    deleteRelation(id: number): Promise<void>;
}